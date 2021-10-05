/**
 Copyright Findie 2021
 */
import {ProcessBaseGeneric, ProcessBaseGenericSettings} from "./ProcessBaseGeneric";
import {VideoSettings} from "../../../electron/types";
import {RendererSettings} from "../../helpers/settings";
import {ProcessStore} from "../Process.store";
import {FFprobeData} from "../../../common/ff/ffprobe";
import {range} from "../../helpers/math";
import {makeObservable} from "mobx";

type HEVCNVENCSettings = ProcessBaseGenericSettings<'hevc_nvenc'> & {
  preset:
    'medium' |
    'fast' |
    'hp' |
    'hq' |
    'bd' |
    'll' |
    'llhq' |
    'llhp'
}
// https://superuser.com/questions/1236275/how-can-i-use-crf-encoding-with-nvenc-in-ffmpeg
// todo overload videoFilters and make use of scale_npp or scale_cuda (if they exists)
export class ProcessHEVCNVENC extends ProcessBaseGeneric<'hevc_nvenc', HEVCNVENCSettings> {

  readonly qualityUnit = 'cq';
  readonly qualityOptions = range(22, 50, 2).map(q => {
    let q_percentage = 100 - ((q - 22) / 2 * 5);

    let text = `${q_percentage}%`;
    if (q === 22) {
      text += ' (crisp picture)';
    }

    if (q === 28) {
      text += ' (can\'t really tell the difference)';
    }

    if (q === 34) {
      text += ' (starting to lose some quality)'
    }

    if (q === 40) {
      text += ' (your usual twitter video)';
    }

    if (q === 46) {
      text += ' (potato quality 🥔)';
    }

    return { text, value: q, default: q === 26 };
  });

  constructor() {
    super('hevc_nvenc', {
      processorName: 'hevc_nvenc',
      version: 1,
      preset: 'medium'
    });
    makeObservable(this);
  }

  protected paramsFromStrategy(details: FFprobeData, durationOrTrimmedDuration: number): string[] {

    const strategyType = RendererSettings.settings.processingParams.strategyType;
    const strategyTune = RendererSettings.settings.processingParams.strategyTune;
    const hasAudio = !!details.audioStream && ProcessStore.volume > 0;

    switch (strategyType) {
      case "constant-quality":
        return [
          '-cq:v', strategyTune.toString(),
          // '-qmin:v', strategyTune.toString(),
          // '-qmax:v', strategyTune.toString(),
          '-preset:v', this.settings.preset,
          '-rc:V', 'vbr_hq',
          '-bf', '2',
        ];

      case "max-file-size":
        const {
          audioBitrateInKb,
          videoBitrateInKb
        } = this.computeAverageBPS(strategyTune, durationOrTrimmedDuration, hasAudio);

        return [
          '-qmin:v', '-1',
          '-qmax:v', '-1',
          '-b:v', Math.floor(videoBitrateInKb) + 'k',
          '-maxrate:v', Math.floor(videoBitrateInKb) + 'k',
          '-minrate:v', Math.floor(videoBitrateInKb * 0.9) + 'k',
          '-b:a', Math.floor(audioBitrateInKb) + 'k',
          '-bufsize:v', Math.floor(videoBitrateInKb) + 'k',
          '-rc', 'cbr_hq',
          '-bf', '2',
        ];

      default:
        throw new Error('unknown strategy ' + strategyType);
    }
  }

  optimalBitrateCalculator(videoDetails: { width: number, height: number, fps: number }, outputSettings: VideoSettings) {

    const out_h: number = outputSettings.height === 'original' ? videoDetails.height : outputSettings.height;
    const out_w: number = out_h / videoDetails.height * videoDetails.width;
    const out_fps: number = outputSettings.fps === 'original' ? videoDetails.fps : outputSettings.fps;

    const pix_per_sec = out_h * out_w * out_fps;

    // todo update this for av1
    // return {
    //   mayCorrupt: [0, 0.01 * pix_per_sec],
    //   veryBad: [0.01 * pix_per_sec, 0.05 * pix_per_sec],
    //   blockingArtifacts: [0.05 * pix_per_sec, 0.10 * pix_per_sec],
    //   good: [0.10 * pix_per_sec, 0.25 * pix_per_sec],
    //   diminishingReturns: [0.25 * pix_per_sec, 0.30 * pix_per_sec],
    //   wastedSpace: [0.30 * pix_per_sec, Infinity]
    // } as const;
    return {
      mayCorrupt: [0, 0],
      veryBad: [0, 0],
      blockingArtifacts: [0, 0],
      good: [0, Infinity],
      diminishingReturns: [0, 0],
      wastedSpace: [0, 0]
    } as const;
  }

}


