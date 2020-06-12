import * as path from "path";
import {app, remote} from 'electron';

export namespace ResourceHelpers {

  export function app_dir(...paths: string[]) {
    if (!app) {
      return path.join(remote.app.getAppPath(), ...paths);
    }
    return path.join(app.getAppPath(), ...paths);
  }

  export function bin_dir(pth: string) {
    if (process.platform === 'win32') {
      return app_dir('bin', 'windows-64', pth);
    } else if (process.platform === 'linux') {
      return app_dir('bin', 'linux-64', pth);
    } else if (process.platform === 'darwin') {
      return app_dir('bin', 'osx-64', pth);
    } else {
      throw new Error('unsupported platform ' + process.platform + ' ' + process.arch);
    }
  }

}