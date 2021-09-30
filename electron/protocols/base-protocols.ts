import {CustomScheme, FilePathWithHeaders, protocol, Request, ProtocolRequest} from 'electron';
import {logError} from "../../common/sentry";

abstract class Protocol {
  readonly protocolName: string

  protected constructor(protocolName: string) {
    this.protocolName = protocolName;
    console.log('Creating protocol ' + protocolName);
  }

  protected abstract _register(): void;

  register(): void {
    console.log('Registering protocol ' + this.protocolName);
    this._register();
  }

  get privileges(): CustomScheme[] {
    return [{
      scheme: this.protocolName,
      privileges: {
        standard: false,
        supportFetchAPI: true,
        corsEnabled: true
      }
    }];
  }

  abstract onRequest(req: ProtocolRequest, ...data: any[]): Promise<any>
}

export abstract class FileProtocol extends Protocol {
  _register() {
    protocol.registerFileProtocol(this.protocolName, async (request, callback) => {
      const data = await this.onRequest(request);
      callback(data);
    });
  }

  abstract onRequest(req: ProtocolRequest): Promise<FilePathWithHeaders>
}

export abstract class StringProtocol extends Protocol {
  _register() {
    protocol.registerStringProtocol(this.protocolName, async (request, callback) => {
      const data = await this.onRequest(request);
      callback({
        data,
        mimeType: 'plain/text'
      });
    });
  }

  abstract onRequest(req: ProtocolRequest): Promise<string>
}


export type ErrorLike = {
  message: string
  name: string
  stack: string
}

export type JSONProtocolResponse<T> = {
  success: T
} | {
  error: ErrorLike
};

export function isJSONProtocolError(data: JSONProtocolResponse<any>): data is ({ error: ErrorLike }) {
  return !!(data as any).error;
}

export abstract class JSONProtocol extends Protocol {
  _register() {
    protocol.registerStringProtocol(this.protocolName, async (request, callback) => {
      const uploadData = request.uploadData ?? [];
      const jsonData = uploadData.length > 0 ? JSON.parse(uploadData[0].bytes.toString()) : null;

      try {
        const data = await this.onRequest(request, jsonData);
        callback({
          data: JSON.stringify({
            success: data
          }),
          mimeType: 'application/json'
        });
      } catch (e) {

        logError(e);
        console.error(e);

        callback({
          data: JSON.stringify({
            error: {
              ...e,
              stack: e.stack,
              message: e.message,
              name: e.name
            }
          }),
          mimeType: 'application/json'
        })
      }
    });
  }

  abstract onRequest(req: ProtocolRequest, payload: any): Promise<any>
}


export abstract class JSONAndStreamProtocol extends JSONProtocol {

  readonly streamProtocolName: string
  protected constructor(protocolName: string) {
    super(protocolName);
    this.streamProtocolName = `${this.protocolName}-stream`;
  }

  _register() {
    super._register();

    protocol.registerStreamProtocol(this.streamProtocolName, async (request, cb) => {
      const jsonData = request?.uploadData?.length > 0 ? JSON.parse(request.uploadData[0].bytes.toString()) : null;

      const stream = await this.onRequestStream(request, jsonData);

      return cb(stream);
    })
  }

  abstract onRequestStream(req: Request, payload: any): Promise<any>

  get privileges(): CustomScheme[] {
    return [{
      scheme: this.protocolName,
      privileges: {
        standard: false,
        supportFetchAPI: true,
        corsEnabled: true
      }
    }, {
      scheme: this.streamProtocolName,
      privileges: {
        standard: false,
        supportFetchAPI: true,
        corsEnabled: true
      }
    }];
  }
}
