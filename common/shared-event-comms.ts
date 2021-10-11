/**
 Copyright Findie 2021
 */

import type {IpcMain, IpcMainEvent, IpcRenderer, IpcRendererEvent, WebContents} from 'electron';

export type RendererToMainAsyncEvents = {
  'register-ffmpeg': (pid: number) => void
};

export type MainToRenderAsyncEvents = {
  'open-file': () => void
};

export function registerMainHandler<C extends keyof RendererToMainAsyncEvents>(
  pipe: IpcMain,
  channel: C,
  handler: (event: IpcMainEvent, ...args: Parameters<RendererToMainAsyncEvents[C]>) => void
) {
  pipe.on(channel, (event, ...args) => {
    handler(event, ...args as Parameters<RendererToMainAsyncEvents[C]>);
  });
}

export function registerRendererHandler<C extends keyof MainToRenderAsyncEvents>(
  pipe: IpcRenderer,
  channel: C,
  handler: (event: IpcRendererEvent, ...args: Parameters<MainToRenderAsyncEvents[C]>) => void
) {
  pipe.on(channel, (event, ...args) => {
    handler(event, ...args as Parameters<MainToRenderAsyncEvents[C]>);
  });
}

export function sendToMain<C extends keyof RendererToMainAsyncEvents>(
  pipe: IpcRenderer,
  channel: C,
  ...args: Parameters<RendererToMainAsyncEvents[C]>
) {
  // pipe.sendToHost(channel, ...args);
  pipe.send(channel, ...args);
}

export function sendToRenderer<C extends keyof MainToRenderAsyncEvents>(
  wc: WebContents,
  channel: C,
  ...args: Parameters<MainToRenderAsyncEvents[C]>
) {
  wc.send(channel, ...args);
}
