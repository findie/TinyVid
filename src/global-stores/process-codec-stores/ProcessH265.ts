/**
 Copyright Findie 2021
 */
import {ProcessBaseGeneric, ProcessBaseGenericSettings} from "./ProcessBaseGeneric";
import {VideoSettings} from "../../../electron/types";
import {RendererSettings} from "../../helpers/settings";
import {ProcessStore} from "../Process.store";
import {FFprobeData} from "../../../common/ff/ffprobe";
import {range} from "../../helpers/math";
import {H264EncodingSpeedPresetsType, ProcessH264} from "./ProcessH264";
import {makeObservable} from "mobx";

type H265Settings = ProcessBaseGenericSettings<'libx265'> & {
  preset: H265EncodingSpeedPresetsType
  tune: 'grain'|'animation'|'none'
}

export type H265EncodingSpeedPresetsType = H264EncodingSpeedPresetsType;

export class ProcessH265 extends ProcessBaseGeneric<'libx265', H265Settings> {

  readonly qualityUnit = 'crf';
  readonly qualityOptions: { text: string; value: number; }[] = range(22, 50, 2).map(q => {
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
    super('libx265', {
      processorName: 'libx265',
      version: 1,
      preset: 'medium',
      tune: 'none',
    });
    makeObservable(this);
  }

  protected paramsFromStrategy(details: FFprobeData, durationOrTrimmedDuration: number) {

    const strategyType = RendererSettings.settings.processingParams.strategyType;
    const strategyTune = RendererSettings.settings.processingParams.strategyTune;
    const hasAudio = !!details.audioStream && ProcessStore.volume > 0;

    const commonParams: string[] = [];
    if (this.settings.tune !== 'none') {
      commonParams.push(...['-tune', this.settings.tune]);
    }

    switch (strategyType) {
      case "constant-quality":
        return [
          '-crf', strategyTune.toString(),
          '-preset', this.settings.preset,
          ...commonParams
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
          '-preset:v', this.settings.preset,
          '-x265-params', "nal-hrd=cbr",
          ...commonParams
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

    // todo update this for h265
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

  // todo make tests for this
  // https://write.corbpie.com/ffmpeg-preset-comparison-x264-2019-encode-speed-and-file-size/
  static readonly benchmarksH265: ({ [s in H264EncodingSpeedPresetsType]: { fps: number, kbit: number } }) = {
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

  static readonly encodingSpeedPresets: H264EncodingSpeedPresetsType[] = ProcessH264.encodingSpeedPresets;

  static readonly encodingSpeedPresetsDisplay: string[] = ProcessH264.encodingSpeedPresetsDisplay;
}


