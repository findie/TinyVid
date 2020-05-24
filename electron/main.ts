import {app, BrowserWindow, protocol} from 'electron';
import * as path from 'path';
import * as url from 'url';

let mainWindow: Electron.BrowserWindow | null;

function createProtocols() {
  protocol.registerFileProtocol('video', (request, callback) => {
    const url = request.url.substr('video://'.length)
    callback({
      path: url,
      headers: {}
    });
  }, (error) => {
    if (error) console.error('Failed to register video:// protocol')
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      webSecurity: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL(`http://localhost:4000`);
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, '../index.html'),
        protocol: 'file:',
        slashes: true
      })
    );
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  createProtocols();
  createWindow();
});
app.allowRendererProcessReuse = true;