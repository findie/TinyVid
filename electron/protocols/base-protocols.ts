import {CustomScheme, FilePathWithHeaders, protocol, ProtocolRequest} from 'electron';
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

export type JSONProtocolResponseSuccess<T> = {
  success: T
}
export type JSONProtocolResponseError = {
  error: ErrorLike
}

export type JSONProtocolResponse<T> = JSONProtocolResponseSuccess<T> | JSONProtocolResponseError;

export function isJSONProtocolError(data: JSONProtocolResponse<any>): data is ({ error: ErrorLike }) {
  return !!(data as any).error;
}

export function JSONProtocolResponseToError(data: JSONProtocolResponseError) {
  const e = new Error(data.error.message);
  Object.assign(e, data.error);
  return e;
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

export enum StreamProtocolErrorCodes {
  CONTEXT_SHUT_DOWN = -26
}

export class StreamProtocolError extends Error {
  name = 'StreamProtocolError'
  readonly code: number

  constructor(code: number | StreamProtocolErrorCodes, message: string) {
    super(message);
    this.code = code;
  }
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
      const jsonData = (request?.uploadData?.length ?? 0) > 0 ? JSON.parse(request.uploadData![0].bytes.toString()) : null;

      try {
        const stream = await this.onRequestStream(request, jsonData);
        return cb({ data: stream });
      } catch (e) {
        console.error(e);
        // https://source.chromium.org/chromium/chromium/src/+/master:net/base/net_error_list.h
        cb({
          error: e
        });
      }
    })
  }

  abstract onRequestStream(req: ProtocolRequest, payload: any): Promise<NodeJS.ReadableStream | Buffer | string>

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
