import "source-map-support/register"
import "./helpers/log"

import {app, BrowserWindow, session, shell} from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as os from 'os';
import {Protocols} from "./protocols";
import {TrimProtocol} from "./protocols/proto/trim";

let mainWindow: Electron.BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.join(app.getAppPath(), 'icon.png'),
    title: `QuickTrim - v${app.getVersion()}`,
    center: true,
    autoHideMenuBar: true,
    width: 900,
    height: 656,
    minHeight: 600,
    minWidth: 900,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      webSecurity: true,
    },
  });

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
    mainWindow?.webContents.executeJavaScript('window.dispatchEvent(new Event("x-closing-window"))');
    e.preventDefault();
    e.returnValue = true;
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    console.log('Killing process because window is closed');

    // kill ffmpegs
    Protocols
      .list
      .find((x): x is TrimProtocol.TrimProtocol => x instanceof TrimProtocol.TrimProtocol)!
      .terminateAll();

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

    event.preventDefault();
  });

  contents.on('new-window', async (event, navigationUrl) => {
    // In this example, we'll ask the operating system
    // to open this event's url in the default browser.
    event.preventDefault();

    await shell.openExternal(navigationUrl);
  })
});

app.on('ready', () => {
  Protocols.register();
  createWindow();

  if (!app.isPackaged) {
    session.defaultSession.loadExtension(
      path.join(os.homedir(), '.config/google-chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.7.0_0/')
    )
      .then(ex => console.log('Registered extension ' + ex.name))
      .catch(e => console.error('Failed to register extension fmkadmapgofadopljbjfkapdkoienihi (React Dev Tools)', e));
  }
});
app.allowRendererProcessReuse = true;