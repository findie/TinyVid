import {DetailsProtocol} from "./proto/details";
import {VideoProtocol} from "./proto/video";
import {TrimProtocol} from "./proto/trim";

export namespace Protocols {

  export const list = [
    new DetailsProtocol.DetailsProtocol(),
    new VideoProtocol.VideoProtocol(),
    new TrimProtocol.TrimProtocol()
  ]

  export function grantPrivileges() {
    list.forEach(p => p.grantPrivileges());
  }

  export function register() {
    list.forEach(p => p.register());
  }
}