/**
 Copyright Findie 2021
 */
import {ProcessBaseGeneric, ProcessBaseGenericSettings} from "./ProcessBaseGeneric";
import {VideoSettings} from "../../../electron/types";
import {RendererSettings} from "../../helpers/settings";
import {ProcessStore} from "../Process.store";
import {FFprobeData} from "../../../common/ff/ffprobe";
import {range} from "../../helpers/math";
import {makeObservable, observable, override} from "mobx";

export type H264Settings = ProcessBaseGenericSettings<'libx264'> & {
  preset: H264EncodingSpeedPresetsType
  tune: 'film' | 'animation' | 'grain' | 'stillimage' | 'none'
}

export type H264EncodingSpeedPresetsType =
  'ultrafast'
  | 'superfast'
  | 'veryfast'
  | 'faster'
  | 'fast'
  | 'medium'
  | 'slow'
  | 'slower'
  | 'veryslow'

export class ProcessH264 extends ProcessBaseGeneric<'libx264', H264Settings> {

  readonly qualityUnit = 'crf';
  readonly qualityOptions = range(18, 44, 2).map(q => {
    let q_percentage = 100 - ((q - 18) / 2 * 5);

    let text = `${q_percentage}%`
    if (q === 18) {
      text += ' (crisp picture)';
    }

    if (q === 22) {
      text += ' (can\'t really tell the difference)';
    }

    if (q === 28) {
      text += ' (starting to lose some quality)'
    }

    if (q === 32) {
      text += ' (your usual twitter video)';
    }

    if (q === 40) {
      text += ' (potato quality 🥔)';
    }

    return { text, value: q, default: q === 20 };
  });

  constructor() {
    super('libx264', {
      processorName: 'libx264',
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
          '-x264-params', "nal-hrd=cbr",
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

    return {
      mayCorrupt: [0, 0.01 * pix_per_sec],
      veryBad: [0.01 * pix_per_sec, 0.05 * pix_per_sec],
      blockingArtifacts: [0.05 * pix_per_sec, 0.10 * pix_per_sec],
      good: [0.10 * pix_per_sec, 0.25 * pix_per_sec],
      diminishingReturns: [0.25 * pix_per_sec, 0.30 * pix_per_sec],
      wastedSpace: [0.30 * pix_per_sec, Infinity]
    } as const;
  }

  // https://write.corbpie.com/ffmpeg-preset-comparison-x264-2019-encode-speed-and-file-size/
  static readonly benchmarksH264: ({ [s in H264EncodingSpeedPresetsType]: { fps: number, kbit: number } }) = {
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

  static readonly encodingSpeedPresets: H264EncodingSpeedPresetsType[] = [
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

  static readonly encodingSpeedPresetsDisplay: string[] = [
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
}


