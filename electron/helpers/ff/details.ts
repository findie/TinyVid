import {ProcessHelpers} from "../process";
import {FFHelpers} from "./index";
import {existsSync} from "fs";
import * as assert from 'assert';

export namespace VideoDetails {

  export type StringFraction = string;
  export type ColumnDivided = string;
  export type StringNumber = string;

  export type MediaStream = {
    index: number
    codec_name: string
    codec_long_name: string
    profile: string
    codec_type: 'video' | 'audio' | 'data'
    codec_time_base: StringFraction
    codec_tag_string: string
    codec_tag: string

    r_frame_rate: StringFraction
    avg_frame_rate: StringFraction
    time_base: StringFraction

    start_pts: number
    start_time: StringNumber

    duration_ts: number
    duration: StringNumber

    bit_rate: StringNumber

    nb_frames: StringNumber
    nb_read_packets: StringNumber

    tags: ({ [s: string]: string })
  }
  export type DataStream = MediaStream & {
    codec_type: 'data'
  }
  export type VideoStream = MediaStream & {
    codec_type: 'video'

    width: number
    height: number

    coded_width: number
    coded_height: number

    has_b_frames: number
    sample_aspect_ratio: ColumnDivided
    display_aspect_ratio: ColumnDivided

    pix_fmt: string

    level: number

    chroma_location: string
    refs: number

    is_avc: "true" | "false" | string
    nal_length_size: StringNumber


    bits_per_raw_sample: StringNumber
  }
  export type AudioStream = MediaStream & {
    codec_type: 'audio'

    sample_fmt: string
    sample_rate: StringNumber
    channels: number
    channel_layout: string
    bits_per_sample: number

    max_bit_rate: string
  }

  export type MediaFormat = {
    filename: string
    nb_streams: number
    format_name: string
    format_long_name: string

    start_time: StringNumber
    duration: StringNumber
    bit_rate: StringNumber
    probe_score: string

    size: StringNumber

    tags: ({ [s: string]: string })
  }
  export type MediaDetails = {
    format: MediaFormat
    streams: (VideoStream | AudioStream | DataStream)[]
  }


  export async function details(file: string): Promise<MediaDetails> {

    if (!existsSync(file)) {
      throw new Error(`File ${file} doesn't exist`);
    }

    const data = await ProcessHelpers.simpleSpawn(FFHelpers.ffprobe, [
      '-i', file,
      '-show_format',
      '-show_streams',
      '-count_packets',
      '-of', 'json'
    ]);

    return JSON.parse(data.stdout);
  }

  export function parseStringFraction(f: StringNumber): number {
    const atoms = f.split('/');
    assert.strictEqual(atoms.length, 2, 'cannot parse fraction with atoms len !== 2');

    return parseFloat(atoms[0]) / parseFloat(atoms[1]);
  }

}