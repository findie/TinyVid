import {ResourceHelpers} from "../resources";

export namespace FFHelpers {


  export const ffprobe: string = ResourceHelpers.bin_dir('ffprobe');
  export const ffmpeg: string = ResourceHelpers.bin_dir('ffmpeg');

  export const encodingSpeedPresets: EncodingSpeedPresetsType[] = [
    'ultrafast',
    'superfast',
    'veryfast',
    'faster',
    'fast',
    'medium',
    'slow',
    'slower',
    'veryslow',
  ]

  export const encodingSpeedPresetsDisplay: string[] = [
    'ultra fast',
    'super fast',
    'very fast',
    'faster',
    'fast',
    'medium',
    'slow',
    'slower',
    'very slow'
  ]

  export type EncodingSpeedPresetsType =
    'ultrafast'
    | 'superfast'
    | 'veryfast'
    | 'faster'
    | 'fast'
    | 'medium'
    | 'slow'
    | 'slower'
    | 'veryslow'


}