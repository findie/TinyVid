/**
 Copyright Findie 2021
 */
import {ipcMain} from 'electron';
import {registerMainHandler} from "../../common/shared-event-comms";
import isRunning = require("is-running");

export namespace PreventClosing {
  let browserWindow: Electron.BrowserWindow | null = null
  let intervalTimer: ReturnType<typeof setInterval> | null = null

  const pidsToCheck = new Set<number>();

  export function register(w: Electron.BrowserWindow) {
    if (browserWindow) {
      throw new Error('browser already registered!');
    }

    browserWindow = w;

    w.on('close', handleOnClose);
    w.on('closed', handleClosed);
    registerMainHandler(ipcMain, 'register-ffmpeg', addNewPid);
    intervalTimer = setInterval(checkPids, 1000);
  }


  function addNewPid(event: Electron.IpcMainEvent, pid: number) {
    pidsToCheck.add(pid);
  }


  function handleOnClose(e: Electron.Event) {

    checkPids();

    if (pidsToCheck.size && browserWindow) {
      console.log('sending close event to show close dialog');
      browserWindow.webContents.send('x-closing-window');
      e.preventDefault();
      e.returnValue = true;
    }else{
      handleClosed();
    }
  }

  function handleClosed() {
    console.log('Killing process because window is closed');

    for (const pid of pidsToCheck) {
      process.kill(pid, 'SIGKILL');
    }

    // give time for IO to finish
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }

  export function checkPids() {
    for (const pid of pidsToCheck) {
      if (!isRunning(pid)) {
        pidsToCheck.delete(pid);
      }
    }
  }

  export function unregister() {
    if (intervalTimer) {
      clearInterval(intervalTimer);
    }
    browserWindow = null;
    pidsToCheck.clear();
  }
}
