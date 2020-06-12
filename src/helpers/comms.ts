import type {TrimProtocol} from "../../electron/protocols/proto/trim";
import {RenderStrategy, VideoSettings} from "../../electron/types";

export namespace TrimComms {

  export async function checkProcess(id: string): Promise<TrimProtocol.TrimCheckResponse> {
    const f = await fetch('trim://' + id, {
      method: 'get'
    });
    const data: TrimProtocol.TrimCheckResponse = await f.json();

    return data;
  }

 export async function startProcess(fileIn: string, fileOut: string, range: { start: number, end: number }, strategy: RenderStrategy, settings: VideoSettings) : Promise<TrimProtocol.TrimStartResponse>{

    const f = await fetch('trim://' + fileIn, {
      method: 'post',
      body: JSON.stringify({
        start: range.start,
        end: range.end,
        out: fileOut,
        strategy,
        settings
      }),
      headers: { 'content-type': 'application/json' }
    });

    const data: TrimProtocol.TrimStartResponse = await f.json();

    return data;
  }

}