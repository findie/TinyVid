import type {TrimProtocol} from "../../electron/protocols/proto/trim";
import {AudioSettings, RenderStrategy, TrimPostData, VideoSettings} from "../../electron/types";
import {DetailsProtocol} from "../../electron/protocols/proto/details";
import {VideoDetails} from "../../electron/helpers/ff/details";
import {round} from "./math";
import {
  isJSONProtocolError,
  JSONProtocolResponse,
  JSONProtocolResponseToError
} from "../../electron/protocols/base-protocols";
import {AudioStream, MediaDetails, StringFraction, VideoStream} from "../../common/ff/types";
import type {ExternalProgramProtocol} from "../../electron/protocols/proto/external-program";
import {streamToLineIterator} from "./stream";

function getJSONProtocolDataOrThrow<T>(data: JSONProtocolResponse<T>): T {
  if (isJSONProtocolError(data)) {
    throw JSONProtocolResponseToError(data);
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

export namespace DetailsComms {

  export type SimpleVideoDetails = {
    fps: number
    width: number
    height: number
    duration: number,
    videoCodec: string | null,
    pixelFormat: string | null,
    audioCodec: string | null,
    containerFormats: string[]
  }

  export async function getDetails(file: string): Promise<DetailsProtocol.DetailsProtocolResponse> {
    const f = await fetch('details://' + encodeURIComponent(file), {
      method: 'get',
    });
    const data: JSONProtocolResponse<DetailsProtocol.DetailsProtocolResponse> = await f.json();

    return getJSONProtocolDataOrThrow(data);
  }

  export function videoStream(data: DetailsProtocol.DetailsProtocolResponse): VideoStream | null {
    return data.streams.find((x): x is VideoStream => x.codec_type === 'video') || null;
  }

  export function audioStream(data: DetailsProtocol.DetailsProtocolResponse): AudioStream | null {
    return data.streams.find((x): x is AudioStream => x.codec_type === 'audio') || null;
  }

  export function duration(data: DetailsProtocol.DetailsProtocolResponse): number {
    return parseFloat(data.format.duration || videoStream(data)?.duration || '0');
  }

  export function frameSize(data: DetailsProtocol.DetailsProtocolResponse): { width: number, height: number } {
    const video = videoStream(data);
    if (!video) return { height: 0, width: 0 };

    return {
      width: video.width,
      height: video.height,
    }
  }

  export function fps(data: DetailsProtocol.DetailsProtocolResponse): number {
    const video = videoStream(data);
    if (!video) return 0;

    return round(
      (
        VideoDetails.parseStringFraction(video.avg_frame_rate || ('0/0' as StringFraction)) ||
        VideoDetails.parseStringFraction(video.r_frame_rate || ('0/0' as StringFraction)) ||
        0
      ),
      2
    )
  }

  export function codecs(data: DetailsProtocol.DetailsProtocolResponse): Pick<SimpleVideoDetails, 'audioCodec' | 'videoCodec'> {
    const video = videoStream(data);
    const audio = audioStream(data);

    return {
      videoCodec: video?.codec_name || null,
      audioCodec: audio?.codec_name || null,
    }
  }

  export function pixelFormat(data: DetailsProtocol.DetailsProtocolResponse): string {
    const video = videoStream(data);
    return video?.pix_fmt || '';
  }

  export function formats(data: DetailsProtocol.DetailsProtocolResponse): string[] {
    const { format } = data;
    return (format.format_name || '').split(',').map(x => x.trim());
  }

  export function simplifyMediaDetails(data: DetailsProtocol.DetailsProtocolResponse): SimpleVideoDetails {
    return {
      fps: fps(data),
      duration: duration(data),
      containerFormats: formats(data),
      pixelFormat: pixelFormat(data),
      ...frameSize(data),
      ...codecs(data),
    }
  }
}


class ExternalProgramInstance {
  readonly comms: ExternalProgramComms<string>;
  readonly taskID: string;

  constructor(taskID: string, comms: ExternalProgramComms<string>) {
    this.taskID = taskID;
    this.comms = comms;
  }

  getPipe = async (pipe: number): Promise<ReadableStream<string> | null> => {
    const sr = await fetch(`${this.comms.protoStreamName}://${this.taskID}`, {

      method: 'post',
      body: JSON.stringify({
        stdioPort: pipe
      })

    });

    if (!sr.body) return null;

    const stream = sr.body
      .pipeThrough(new TextDecoderStream())

    return stream;
  }

  getPipeLineReader = async (pipe: number) => {
    const stream = await this.getPipe(pipe);
    if (!stream) return null;

    return streamToLineIterator(stream);
  }


  waitExit = async () => {
    while (true) {
      const r = await fetch(`${this.comms.protoName}://check`, {
        method: 'POST',
        body: JSON.stringify({
          id: this.taskID
        })
      });

      const task = getJSONProtocolDataOrThrow<ReturnType<ExternalProgramProtocol.ExternalProgramProtocol<any>['check']>>(
        await r.json()
      );

      if (task?.done || task?.cancelled || task?.exitSig || task?.exitCode || task?.error) {
        return task;
      }

      await new Promise(_ => setTimeout(_, 500));
    }
  }

}

export class ExternalProgramComms<ProtocolName extends string> {
  readonly protoName: ProtocolName;
  readonly protoStreamName: `${ProtocolName}-stream`

  constructor(protoName: ProtocolName) {
    this.protoName = protoName;
    this.protoStreamName = `${this.protoName}-stream` as ExternalProgramComms<ProtocolName>["protoStreamName"];
  }

  run = async (data: ExternalProgramProtocol.ExternalProgramProtocolRunPayload): Promise<ExternalProgramInstance> => {
    const r = await fetch(`${this.protoName}://run`, {
      method: 'post',
      body: JSON.stringify(data)
    });

    const { id } = getJSONProtocolDataOrThrow<{ id: string }>(await r.json());

    return new ExternalProgramInstance(id, this);
  }
}

// @ts-ignore
window.ExternalProgramComms = ExternalProgramComms;
