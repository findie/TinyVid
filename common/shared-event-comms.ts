/**
 Copyright Findie 2021
 */

import type {app} from 'electron'

export type SharedEventComms = {
  getAppPath: typeof app.getAppPath;
  getPath: typeof app.getPath;

  getAppPathAsync: () => Promise<string>;
}

export type RendererSharedEventComms = {
  [f in keyof SharedEventComms]: SharedEventComms[f]
}
