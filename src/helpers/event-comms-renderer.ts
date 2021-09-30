/**
 Copyright Findie 2021
 */
import {ipcRenderer} from 'electron';
import {v4 as uuid} from 'uuid';
import {RendererSharedEventComms} from "../../common/shared-event-comms";

function makeSyncCallInvoker<T extends (...args: any[]) => Exclude<any, Promise<any>>>(name: string): T {

  const fn = (...args: Parameters<T>): ReturnType<T> => {
    return ipcRenderer.sendSync('sync:' + name, ...args);
  };

  return fn as T;
}

function makeAsyncCallInvoker<T extends (...args: any[]) => Promise<any>>(name: string): T {

  let counterIndex = 0;

  const fn = async (...args: Parameters<T>) => {

    const myTicket = `async:${name}-${counterIndex++}-${uuid()}`;
    if (counterIndex >= 1e6) {
      counterIndex = 0;
    }

    ipcRenderer.send('async:' + name, myTicket, args);
    // console.log('sent ', name, myTicket, args);

    return new Promise((res, rej) => {

      ipcRenderer.once(myTicket, (event, data: { res?: any, rej?: any }) => {
        // console.log('got reply on', myTicket, data);

        if (data.rej) {
          return rej(data.rej);
        }
        return res(data.res);
      });

    })
  };

  return fn as T;
}

export const RendererEventComms: RendererSharedEventComms = {
  getAppPath: makeSyncCallInvoker('getAppPath'),
  getPath: makeSyncCallInvoker('getPath'),
  getAppPathAsync: makeAsyncCallInvoker('getAppPathAsync')
}
