import type {TrimProtocol} from "../../electron/protocols/proto/trim";
import {AudioSettings, RenderStrategy, TrimPostData, VideoSettings} from "../../electron/types";
import {isJSONProtocolError, JSONProtocolResponse} from "../../electron/protocols/base-protocols";
import {AudioStream, MediaDetails, StringFraction, VideoStream} from "../../common/ff/types";

function getJSONProtocolDataOrThrow<T>(data: JSONProtocolResponse<T>): T {
  if (isJSONProtocolError(data)) {
    const e = new Error(data.error.message);
    Object.assign(e, data.error);
    throw e;
  }

  return data.success;
}

export namespace TrimComms {

  export async function checkProcess(id: string): Promise<TrimProtocol.TrimCheckResponse> {
    const f = await fetch('trim://' + id, {
      method: 'get'
    });
    const data: JSONProtocolResponse<TrimProtocol.TrimCheckResponse> = await f.json();

    return getJSONProtocolDataOrThrow(data);
  }

  export async function startProcess(fileIn: string, fileOut: string, range: { start: number, end: number }, strategy: RenderStrategy, settings: VideoSettings, audio: AudioSettings, mediaDetails: MediaDetails): Promise<TrimProtocol.TrimStartResponse> {

    const body: TrimPostData = {
      start: range.start,
      end: range.end,
      out: fileOut,
      strategy,
      settings,
      audio,
      mediaDetails
    }

    const f = await fetch('trim://' + encodeURIComponent(fileIn), {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' }
    });

    const data: JSONProtocolResponse<TrimProtocol.TrimStartResponse> = await f.json();

    return getJSONProtocolDataOrThrow(data);
  }

  export async function cancelProcess(id: string) {
    const f = await fetch('trim://' + id, {
      method: 'delete'
    });

    const data: JSONProtocolResponse<null> = await f.json();

    return getJSONProtocolDataOrThrow(data);
  }

}
