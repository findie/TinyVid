import {AudioStream, MediaDetails, MediaFormat, StringFraction, VideoStream} from "./types";
import {existsSync} from "fs";
import {ProcessHelpers} from "../process";
import assert from "assert";
import {round} from "../../src/helpers/math";
import {DeepReadonly} from "utility-types";
import {ResourceHelpers} from "../../electron/helpers/resources";

/**
 Copyright Findie 2021
 */

export namespace FFprobe {

  const ffprobe = ResourceHelpers.bin_dir('ffprobe');

  export async function getDetails(file: string): Promise<FFprobeData> {

    if (!existsSync(file)) {
      throw new Error(`File ${file} doesn't exist`);
    }

    const data = await ProcessHelpers.simpleSpawn(ffprobe, [
      '-i', file,
      '-hide_banner',
      '-show_format',
      '-show_streams',
      '-of', 'json'
    ]);

    return new FFprobeData(JSON.parse(data.stdout));
  }

  export function parseStringFraction(f: StringFraction): number {
    const atoms = f.split('/');
    assert.strictEqual(atoms.length, 2, 'cannot parse fraction with atoms len !== 2');

    return parseFloat(atoms[0]) / parseFloat(atoms[1]);
  }

}

export class FFprobeData {

  readonly data: DeepReadonly<MediaDetails>;
  readonly format: DeepReadonly<MediaFormat>;
  readonly streams: MediaDetails['streams'];
  readonly videoStream: DeepReadonly<VideoStream> | null;
  readonly audioStream: DeepReadonly<AudioStream> | null;

  readonly duration: number;

  readonly width: number;
  readonly height: number
  readonly fps: number;
  readonly pixelFormat: string;


  readonly videoCodec: string | null;
  readonly audioCodec: string | null;
  readonly containerFormats: string[];

  constructor(data: MediaDetails) {
    this.data = data;
    this.format = data.format;
    this.streams = data.streams;
    this.videoStream = data.streams.find((x): x is VideoStream => x.codec_type === 'video') || null;
    this.audioStream = data.streams.find((x): x is AudioStream => x.codec_type === 'audio') || null;

    this.duration = parseFloat(data.format.duration || this.videoStream?.duration || '0');

    if (this.videoStream) {
      this.width = this.videoStream.width;
      this.height = this.videoStream.height;
      this.fps = round(
        (
          FFprobe.parseStringFraction(this.videoStream.avg_frame_rate || ('0/0' as StringFraction)) ||
          FFprobe.parseStringFraction(this.videoStream.r_frame_rate || ('0/0' as StringFraction)) ||
          0
        ),
        2
      );
      this.pixelFormat = this.videoStream.pix_fmt || '';
    } else {
      this.width = 0;
      this.height = 0;
      this.fps = 0;
      this.pixelFormat = '';
    }

    this.videoCodec = this.videoStream?.codec_name ?? null;
    this.audioCodec = this.audioStream?.codec_name ?? null;

    this.containerFormats = (this.format.format_name || '').split(',').map(x => x.trim());
  }
}

