import {JSONProtocol} from "../base-protocols";
import {strictEqual} from "assert";
import {VideoDetails} from "../../helpers/ff/details";

export namespace DetailsProtocol {

  export type DetailsProtocolResponse = VideoDetails.MediaDetails;

  export class DetailsProtocol extends JSONProtocol {
    constructor() {
      super('details');
    }

    async onRequest(req: Electron.Request, payload: any): Promise<DetailsProtocolResponse> {
      const pathname = req.url.replace(`${this.protocolName}://`, '');

      return await VideoDetails.details(pathname);
    }
  }

}