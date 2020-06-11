import {JSONProtocol} from "../base-protocols";
import {strictEqual} from "assert";
import {FFHelpers} from "../../ffhelpers";
import {check, trim} from "../../trim";

export namespace TrimProtocol {

  export class TrimProtocol extends JSONProtocol {
    constructor() {
      super('trim');
    }

    async onRequest(req: Electron.Request, payload: any): Promise<any> {
      const url = new URL(req.url);

      strictEqual(url.origin, 'null');
      const { pathname } = url;

      switch (req.method) {
        case 'POST':
          return this.startTrim(pathname, payload);
        case 'GET':
          return this.checkTrim(pathname);
      }
      return {};
    }

    startTrim(path: string, data: {
      start: number,
      end: number,
      out: string | undefined,
      strategy: FFHelpers.RenderStrategy,
      settings: FFHelpers.VideoSettings
    }) {
      trim(path, data.start, data.end, data.out, data.strategy, data.settings);

      return {};
    }

    checkTrim(path: string) {
      return check(path);
    }
  }

}