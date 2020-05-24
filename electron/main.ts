import {app, BrowserWindow, protocol} from 'electron';
import * as path from 'path';
import * as url from 'url';
import {check, trim} from "./trim";

let mainWindow: Electron.BrowserWindow | null;

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'trim',
    privileges: {
      supportFetchAPI: true
    }
  }
])

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

  protocol.registerStringProtocol('trim', (req, cb) => {

    if (req.method === 'POST') {
      const payload: { start: number, end: number, out: string | undefined } = JSON.parse(req.uploadData[0].bytes.toString())

      trim(req.url.replace('trim://', ''), payload.start, payload.end, payload.out);

      return cb({
        data: JSON.stringify({}),
        mimeType: 'application/json'
      })
    }
    if (req.method === 'GET') {

      return cb({
        data: JSON.stringify(check(req.url.replace('trim://', ''))),
        mimeType: 'application/json'
      })
    }

    cb({
      data: JSON.stringify({ req }),
      mimeType: 'application/json'
    })

  }, (error) => {
    if (error) console.error('Failed to register trim:// protocol')
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      // webSecurity: false,
    },
  });

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

app.on('ready', () => {
  createProtocols();
  createWindow();
});
app.allowRendererProcessReuse = true;