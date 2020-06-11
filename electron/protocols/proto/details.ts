import {JSONProtocol} from "../base-protocols";
import {strictEqual} from "assert";
import {VideoDetails} from "../../helpers/ff/details";

export namespace DetailsProtocol {

  export class DetailsProtocol extends JSONProtocol {
    constructor() {
      super('details');
    }

    async onRequest(req: Electron.Request, payload: any): Promise<any> {
      const url = new URL(req.url);

      strictEqual(url.origin, 'null');
      const { pathname } = url;

      return await VideoDetails.details(pathname);
    }
  }

}