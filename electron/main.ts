import "source-map-support/register"

import {app, BrowserWindow, session} from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as os from 'os';
import {Protocols} from "./protocols";

let mainWindow: Electron.BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.join(app.getAppPath(), 'icon.png'),
    title: 'QuickTrim',
    center: true,
    autoHideMenuBar: true,
    width: 900,
    height: 656,
    minHeight: 600,
    minWidth: 900,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      // webSecurity: false,
    },
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

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

Protocols.grantPrivileges();
app.on('ready', () => {
  Protocols.register();
  createWindow();
  session.defaultSession.loadExtension(
    path.join(os.homedir(), '.config/google-chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.7.0_0/')
  ).then(console.log)
});
app.allowRendererProcessReuse = true;