import {JSONProtocol} from "../base-protocols";
import {VideoDetails} from "../../helpers/ff/details";
import {MediaDetails} from "../../../common/ff/types";

export namespace DetailsProtocol {

  export type DetailsProtocolResponse = MediaDetails;

  export class DetailsProtocol extends JSONProtocol {
    constructor() {
      super('details');
    }

    async onRequest(req: Electron.ProtocolRequest, payload: any): Promise<DetailsProtocolResponse> {
      const pathname = decodeURIComponent(req.url.replace(`${this.protocolName}://`, ''));

      return await VideoDetails.details(pathname);
    }
  }

}
