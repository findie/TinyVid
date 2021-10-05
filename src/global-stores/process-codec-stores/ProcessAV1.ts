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

type AV1Settings = ProcessBaseGenericSettings<'libaom-av1'> & {
  cpuUsed: number // 0 to 8, default 1
  tiles: `${1 | 2 | 3 | 4 | 5 | 6}x${1 | 2 | 3 | 4 | 5 | 6}`
}

export class ProcessAV1 extends ProcessBaseGeneric<'libaom-av1', AV1Settings> {

  readonly qualityUnit = 'crf';
  readonly qualityOptions = range(22, 56, 2).map(q => {
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

    if (q === 46) {
      text += ' (your usual twitter video)';
    }

    if (q === 50) {
      text += ' (potato quality 🥔)';
    }

    return { text, value: q, default: q === 26 };
  });

  constructor() {
    super('libaom-av1', {
      processorName: 'libaom-av1',
      version: 2,
      cpuUsed: 8,
      tiles: '4x4',
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
          '-crf', strategyTune.toString(),
          '-b:v', '0',
          '-cpu-used', this.settings.cpuUsed.toString(),
          '-row-mt', '1',
          '-tiles', this.settings.tiles,
          '-strict', '-2',
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

          '-cpu-used', this.settings.cpuUsed.toString(),
          '-row-mt', '1',
          '-tiles', this.settings.tiles,
          '-strict', '-2',
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


