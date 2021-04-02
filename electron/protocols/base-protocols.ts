import {CustomScheme, FilePathWithHeaders, protocol, Request} from 'electron';
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

  get privileges(): CustomScheme {
    return {
      scheme: this.protocolName,
      privileges: {
        standard: false,
        supportFetchAPI: true,
        corsEnabled: true
      }
    };
  }

  abstract async onRequest(req: Request, ...data: any[]): Promise<any>
}

export abstract class FileProtocol extends Protocol {
  _register() {
    protocol.registerFileProtocol(this.protocolName, async (request, callback) => {
      const data = await this.onRequest(request);
      callback(data);
    }, (error) => {
      if (error) console.error(`Failed to register ${this.protocolName}:// protocol`)
    });
  }

  abstract async onRequest(req: Request): Promise<FilePathWithHeaders>
}

export abstract class StringProtocol extends Protocol {
  _register() {
    protocol.registerStringProtocol(this.protocolName, async (request, callback) => {
      const data = await this.onRequest(request);
      callback({
        data,
        mimeType: 'plain/text'
      });
    }, (error) => {
      if (error) console.error(`Failed to register ${this.protocolName}:// protocol`)
    });
  }

  abstract async onRequest(req: Request): Promise<string>
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
      const jsonData = request?.uploadData?.length > 0 ? JSON.parse(request.uploadData[0].bytes.toString()) : null;

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
    }, (error) => {
      if (error) console.error(`Failed to register ${this.protocolName}:// protocol`)
    });
  }

  abstract async onRequest(req: Request, payload: any): Promise<any>
}
