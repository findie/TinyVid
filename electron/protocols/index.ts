import {VideoProtocol} from "./proto/video";
import {TrimProtocol} from "./proto/trim";
import {protocol} from 'electron';

export namespace Protocols {

  export const videoProtocol = new VideoProtocol.VideoProtocol();
  export const trimProtocol = new TrimProtocol.TrimProtocol();

  export const list = [
    videoProtocol,
    trimProtocol,
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
