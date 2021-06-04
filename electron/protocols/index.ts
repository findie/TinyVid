import {DetailsProtocol} from "./proto/details";
import {VideoProtocol} from "./proto/video";
import {TrimProtocol} from "./proto/trim";
import {protocol} from 'electron';
import {ExternalProgramProtocol} from "./proto/external-program";
import {FFHelpers} from "../helpers/ff";

export namespace Protocols {

  export const detailProtocol = new DetailsProtocol.DetailsProtocol();
  export const videoProtocol = new VideoProtocol.VideoProtocol();
  export const trimProtocol = new TrimProtocol.TrimProtocol();

  export const ffmpegProtocol = new ExternalProgramProtocol.ExternalProgramProtocol<'ffmpeg'>('ffmpeg', FFHelpers.ffmpeg);
  export const ffprobeProtocol = new ExternalProgramProtocol.ExternalProgramProtocol<'ffprobe'>('ffprobe', FFHelpers.ffprobe);

  export const list = [
    detailProtocol,
    videoProtocol,
    trimProtocol,
    ffmpegProtocol,
    ffprobeProtocol,
  ]

  export function grantPrivileges() {
    protocol.registerSchemesAsPrivileged(list.map(p => {
      console.log('Granting privileges to protocols ' + p.privileges.map(x => x.scheme).join(', '));
      return p.privileges;
    }).flat());
  }

  export function register() {
    list.forEach(p => p.register());
  }
}
