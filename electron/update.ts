import {autoUpdater} from "electron-updater";
import {logger} from "./helpers/log";
import {app, dialog} from 'electron';

export async function update() {
  autoUpdater.logger = logger;
  console.log('setFeedURL', autoUpdater.setFeedURL({
    "provider": "github",
    "owner": "findie",
    "repo": "QuickTrim"
  }))
  console.log('checking for updates', await autoUpdater.checkForUpdates());
  autoUpdater.on('update-downloaded', async (info) => {
    const resp = await dialog.showMessageBox({
      type: 'info',
      title: `${app.getName()} Update`,
      message: `Update ${info.version} is available!\nWould you like to install it?`,
      detail: 'installing the update will close the current app session.',
      buttons: ['Yes, I want the update!', 'No, I\'m doing something right now!'],
      defaultId: 1
    });

    if (resp.response === 0) {
      autoUpdater.quitAndInstall();
    }
  })
}
