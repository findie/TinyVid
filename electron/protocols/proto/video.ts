import {FileProtocol, JSONProtocol} from "../base-protocols";
import {strictEqual} from "assert";
import {VideoDetails} from "../../helpers/ff/details";

export namespace VideoProtocol {

  export class VideoProtocol extends FileProtocol {
    constructor() {
      super('video');
    }

    async onRequest(req: Electron.Request) {
      const url = new URL(req.url);

      strictEqual(url.origin, 'null');
      const { pathname } = url;

      return {
        path: pathname,
        headers: {}
      }
    }
  }

}