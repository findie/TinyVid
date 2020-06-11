import {FilePathWithHeaders, protocol, Request} from 'electron';

abstract class Protocol {
  protected readonly protocolName: string

  protected constructor(protocolName: string) {
    this.protocolName = protocolName;
    console.log('Registering protocol ' + protocolName);
  }

  abstract register(): void;

  grantPrivileges() {
    protocol.registerSchemesAsPrivileged([{
      scheme: this.protocolName,
      privileges: {
        supportFetchAPI: true
      }
    }]);
  }

  abstract async onRequest(req: Request, ...data: any[]): Promise<any>
}

export abstract class FileProtocol extends Protocol {
  register() {
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
  register() {
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


export abstract class JSONProtocol extends Protocol {
  register() {
    protocol.registerStringProtocol(this.protocolName, async (request, callback) => {
      const jsonData = request?.uploadData?.length > 0 ? JSON.parse(request.uploadData[0].bytes.toString()) : null;

      const data = await this.onRequest(request, jsonData);
      callback({
        data: JSON.stringify(data),
        mimeType: 'application/json'
      });
    }, (error) => {
      if (error) console.error(`Failed to register ${this.protocolName}:// protocol`)
    });
  }

  abstract async onRequest(req: Request, payload: any): Promise<any>
}