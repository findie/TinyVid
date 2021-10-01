import {FileProtocol, JSONProtocol} from "../base-protocols";

export namespace VideoProtocol {

  export class VideoProtocol extends FileProtocol {
    constructor() {
      super('video');
    }

    async onRequest(req: Electron.ProtocolRequest) {
      const pathname = decodeURIComponent(req.url.replace(`${this.protocolName}://`, ''));

      return {
        path: pathname,
        headers: {}
      }
    }
  }

}
