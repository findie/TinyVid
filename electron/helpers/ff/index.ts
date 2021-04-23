import {ResourceHelpers} from "../resources";
import {VideoSettings} from "../../types";

export namespace FFHelpers {

  // https://write.corbpie.com/ffmpeg-preset-comparison-x264-2019-encode-speed-and-file-size/
  export const benchmarksH264: ({ [s in EncodingSpeedPresetsType]: { fps: number, kbit: number } }) = {
    veryslow: {
      fps: 19,
      kbit: 2970
    },
    slower: {
      fps: 33,
      kbit: 3185,
    },
    slow: {
      fps: 61,
      kbit: 3200
    },
    medium: {
      fps: 87,
      kbit: 3271
    },
    fast: {
      fps: 95,
      kbit: 3379
    },
    faster: {
      fps: 101,
      kbit: 3600//3226// ????
    },
    veryfast: {
      fps: 114,
      kbit: 4000,//2816// ????
    },
    superfast: {
      fps: 115,
      kbit: 5050
    },
    ultrafast: {
      fps: 123,
      kbit: 7666
    }
  }

  export const ffprobe: string = ResourceHelpers.bin_dir('ffprobe');
  export const ffmpeg: string = ResourceHelpers.bin_dir('ffmpeg');

  console.log('settings ffmpeg to', ffmpeg);
  console.log('settings ffprobe to', ffprobe);

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
    `very slow`
  ];

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

  export function optimalBitrateCalculator(videoDetails: { width: number, height: number, fps: number }, outputSettings: VideoSettings) {

    const out_h: number = outputSettings.height === 'original' ? videoDetails.height : outputSettings.height;
    const out_w: number = out_h / videoDetails.height * videoDetails.width;
    const out_fps: number = outputSettings.fps === 'original' ? videoDetails.fps : outputSettings.fps;

    const pix_per_sec = out_h * out_w * out_fps;

    return {
      mayCorrupt: [0, 0.01 * pix_per_sec],
      veryBad: [0.01 * pix_per_sec, 0.05 * pix_per_sec],
      blockingArtifacts: [0.05 * pix_per_sec, 0.10 * pix_per_sec],
      good: [0.10 * pix_per_sec, 0.25 * pix_per_sec],
      diminishingReturns: [0.25 * pix_per_sec, 0.30 * pix_per_sec],
      wastedSpace: [0.30 * pix_per_sec, Infinity]
    };
  }

  export function computeAverageBPS(fileSizeInBytes: number, durationInSeconds: number, hasAudio: boolean) {
    const fileSizeInKB = fileSizeInBytes * 1000;

    const bitrateInKb = fileSizeInKB / durationInSeconds * 8;

    const audioBitrateInKb = hasAudio
      ? Math.min(bitrateInKb * 0.1, 196) // 10% or at most 196k
      : 0;
    const videoBitrateInKb = bitrateInKb - audioBitrateInKb;

    return {
      videoBitrateInKb,
      audioBitrateInKb,
      totalBitrateInKb: audioBitrateInKb + videoBitrateInKb
    };
  }

}
