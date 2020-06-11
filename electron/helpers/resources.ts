import * as path from "path";
import {app} from 'electron';

export namespace ResourceHelpers {

  export function bin_dir(pth: string) {
    const app_dir = app.getAppPath();
    if (process.platform === 'win32') {
      return path.join(app_dir, 'bin', 'windows-64', pth);
    } else if (process.platform === 'linux') {
      return path.join(app_dir, 'bin', 'linux-64', pth);
    } else if (process.platform === 'darwin') {
      return path.join(app_dir, 'bin', 'osx-64', pth);
    } else {
      throw new Error('unsupported platform ' + process.platform + ' ' + process.arch);
    }
  }
}