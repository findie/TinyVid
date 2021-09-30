import * as path from "path";
import type {App} from 'electron';

const app: App = require('electron').app || require('@electron/remote').app;

export namespace ResourceHelpers {

  export function userData_dir(...paths: string[]) {
    return path.join(app.getPath('userData'), ...paths);
  }

  export function logs_dir(...paths: string[]) {
    return path.join(app.getPath('logs'), ...paths);
  }

  export function temp_dir(...paths: string[]) {
    return path.join(app.getPath('temp'), ...paths);
  }

  export function real_app_dir(...paths: string[]) {
    let appDir = '';

    // check to see if we're in the renderer or main process
    appDir = app.getAppPath();

    // check if we are in an .asar package
    // aka we are a build
    // and move up by 2 folders for the real dir with resources
    if (path.parse(appDir).ext === '.asar') {
      appDir = path.join(appDir, '..', '..');
    }

    return path.join(appDir, ...paths);
  }

  console.log('real_app_dir', real_app_dir());

  export function bin_dir(pth: string) {
    if (process.platform === 'win32') {
      return real_app_dir('bin', 'windows-64', pth);
    } else if (process.platform === 'linux') {
      return real_app_dir('bin', 'linux-64', pth);
    } else if (process.platform === 'darwin') {
      return real_app_dir('bin', 'osx-64', pth);
    } else {
      throw new Error('unsupported platform ' + process.platform + ' ' + process.arch);
    }
  }

}
