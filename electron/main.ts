import "source-map-support/register"
import "./helpers/log"
import "../common/sentry";

import {app, BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions, nativeTheme, session, shell} from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as os from 'os';
import {Protocols} from "./protocols";
import {update} from "./update";
import {enable as enableRemote, initialize as initElectronMain} from '@electron/remote/main';

import {RendererSettings} from "../src/helpers/settings";
import {isMac} from "./helpers";
import {readdirSync} from "fs";

initElectronMain();
let mainWindow: Electron.BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.join(app.getAppPath(), 'icon.png'),
    title: `TinyVid - v${app.getVersion()}`,
    center: true,
    autoHideMenuBar: true,
    width: 900,
    height: 656,
    minHeight: 600,
    minWidth: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // enableRemoteModule: true,
      webSecurity: true,
      // preload: path.join(__dirname, "..", "common", "sentry"),
    },
  });

  enableRemote(mainWindow.webContents);

  const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        ...(isMac ? [] : [
          { role: 'about', click: app.showAboutPanel }
        ]),
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        ...(!app.isPackaged ? [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
        ] : []),
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://kamua.com/tinyvid/?utm_source=TinyVid&utm_medium=menu')
          }
        }
      ]
    }
  ]

  // fixme maybe have a look on why it doesn't like the menu list
  const menu = Menu.buildFromTemplate(template as Array<(MenuItemConstructorOptions) | (MenuItem)>);
  Menu.setApplicationMenu(menu);

  app.setAboutPanelOptions({
    applicationName: 'TinyVid',
    applicationVersion: app.getVersion(),
    website: 'https://kamua.com/tinyvid/?utm_source=TinyVid&amp;utm_medium=about',
    iconPath: 'icon.png',
    version: app.getVersion(),
    copyright: `Kamua ${new Date().getFullYear()}`,
    authors: ['stefan@kamua.com']
  });


  mainWindow.setBackgroundColor(
    RendererSettings.settings.theme === "dark" || nativeTheme.shouldUseDarkColors ?
      '#303030' :
      '#FFFFFF'
  );

  mainWindow.on('page-title-updated', (evt) => {
    evt.preventDefault();
  });

  console.log('NODE_ENV', process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL(`http://localhost:4000`);
  } else {
    console.log('loading', path.join(app.getAppPath(), 'dist/renderer/index.html'))
    mainWindow.loadURL(
      url.format({
        pathname: path.join(app.getAppPath(), 'dist/renderer/index.html'),
        protocol: 'file:',
        slashes: true
      })
    );
  }

  mainWindow.on('close', (e) => {
    console.log('sending close event to show close dialog');
    mainWindow?.webContents.send('x-closing-window');
    e.preventDefault();
    e.returnValue = true;
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    console.log('Killing process because window is closed');

    // give time for IO to finish
    setTimeout(() => {
      process.exit(0);
    }, 100);
  });
}

Protocols.grantPrivileges();


app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl)

    if (app.isPackaged && parsedUrl.hostname === null) {
      return;
    }

    if (!app.isPackaged && parsedUrl.hostname === 'localhost') {
      return;
    }

    console.warn('prevented navigation to', navigationUrl);
    return event.preventDefault();
  });

  contents.on('new-window', async (event, navigationUrl) => {
    // In this example, we'll ask the operating system
    // to open this event's url in the default browser.
    event.preventDefault();

    await shell.openExternal(navigationUrl);
  })
});

app.on('ready', async () => {
  Protocols.register();
  createWindow();

  if (!app.isPackaged) {
    const reactDevPath = path.join(
      os.homedir(),
      '.config/google-chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/'
    );
    const reactDevToolsVer = readdirSync(reactDevPath)[0];

    session.defaultSession.loadExtension(path.join(reactDevPath, reactDevToolsVer))
      .then(ex => console.log('Registered extension ' + ex.name))
      .catch(e => console.error('Failed to register extension fmkadmapgofadopljbjfkapdkoienihi (React Dev Tools)', e));
  }

  try {
    await update();
  } catch (e) {
    console.error('update failed!');
    console.error(e);
  }
});
// app.allowRendererProcessReuse = true;
