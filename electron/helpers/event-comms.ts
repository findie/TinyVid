/**
 Copyright Findie 2021
 */

import {app, ipcMain} from 'electron';
import {SharedEventComms} from "../../common/shared-event-comms";

function makeSyncCallListener<T extends Function>(fn: T, name: string = fn.name): T {
  ipcMain.on(
    `sync:${name}`,
    (event, ...args) => {
      event.returnValue = fn(...args);
    }
  );

  return fn;
}

function makeAsyncCallListener<T extends (...args: any[]) => Promise<any>>(fn: T, name: string = fn.name): T {
  ipcMain.on(
    `async:${name}`,
    (event, replyTicket: number, args: Parameters<T>) => {

      // console.log('get message on', name, 'ticket', replyTicket, 'args', args);

      fn(...args)
        .then(res => event.reply(replyTicket, {
          res
        }))
        .catch(rej => {
          event.reply(replyTicket, {
            rej
          });
        });
    }
  );

  return fn;
}

export function initMainEventComms() {
  const comms: SharedEventComms = {
    getAppPath: makeSyncCallListener(function getAppPath() {
      return app.getAppPath();
    }),
    getPath: makeSyncCallListener(function getPath(name) {
      return app.getPath(name);
    }),
    getAppPathAsync: makeAsyncCallListener(async function getAppPathAsync() {
      await new Promise(_ => setTimeout(_, 10000));
      return app.getAppPath();
    })
  }
  return comms;
}

