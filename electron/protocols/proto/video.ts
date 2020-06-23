import {FileProtocol, JSONProtocol} from "../base-protocols";
import {strictEqual} from "assert";
import {VideoDetails} from "../../helpers/ff/details";

export namespace VideoProtocol {

  export class VideoProtocol extends FileProtocol {
    constructor() {
      super('video');
    }

    async onRequest(req: Electron.Request) {
      const pathname = decodeURIComponent(req.url.replace(`${this.protocolName}://`, ''));

      return {
        path: pathname,
        headers: {}
      }
    }
  }

}