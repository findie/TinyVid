import {DetailsProtocol} from "./proto/details";
import {VideoProtocol} from "./proto/video";
import {TrimProtocol} from "./proto/trim";
import {protocol} from 'electron';

export namespace Protocols {

  export const list = [
    new DetailsProtocol.DetailsProtocol(),
    new VideoProtocol.VideoProtocol(),
    new TrimProtocol.TrimProtocol()
  ]

  export function grantPrivileges() {
    protocol.registerSchemesAsPrivileged(list.map(p => {
      console.log('Granting privileges to protocol ' + p.protocolName);
      return p.privileges;
    }));
  }

  export function register() {
    list.forEach(p => p.register());
  }
}