import {ResourceHelpers} from "../resources";
import {VideoSettings} from "../../types";

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

  export function computeAverageBPS(fileSizeInBytes: number, durationInSeconds: number) {
    const fileSizeInKB = fileSizeInBytes * 1000;

    const bitrateInKb = fileSizeInKB / durationInSeconds * 8;

    const audioBitrateInKb = Math.min(bitrateInKb * 0.1, 196); // 10% or at most 128k
    const videoBitrateInKb = bitrateInKb - audioBitrateInKb;

    return {
      videoBitrateInKb,
      audioBitrateInKb,
      totalBitrateInKb: audioBitrateInKb + videoBitrateInKb
    };
  }

}