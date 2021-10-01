/**
 Copyright Findie 2021
 */
import {ProcessBaseGeneric, ProcessBaseGenericSettings} from "./ProcessBaseGeneric";
import {AudioSettings, RenderStrategy, VideoSettings} from "../../../electron/types";
import {RendererSettings} from "../../helpers/settings";
import {ProcessStore} from "../Process.store";
import {FFprobeData} from "../../../common/ff/ffprobe";
import {ff_getAudioTrackIndexes} from "../../../common/ff";

type H264Settings = ProcessBaseGenericSettings<'libx264'> & {
  preset: EncodingSpeedPresetsType
}

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

export class ProcessH264 extends ProcessBaseGeneric<'libx264', H264Settings> {

  constructor() {
    super('libx264', {
      processorName: 'libx264',
      version: 1,
      preset: 'medium'
    });
  }

  private strategy2params=(details: FFprobeData, durationOrTrimmedDuration: number) =>{

    const strategyType = RendererSettings.settings.processingParams.strategyType;
    const strategyTune = RendererSettings.settings.processingParams.strategyTune;
    const hasAudio = !!details.audioStream && ProcessStore.volume > 0;

    switch (strategyType) {
      case "constant-quality":
        return [
          '-crf', strategyTune.toString(),
          '-preset', this.settings.preset
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
          '-x264-params', "nal-hrd=cbr"
        ];

      default:
        throw new Error('unknown strategy ' + strategyType);
    }
  }

   settings2filters = ()=> {
    const settings = ProcessStore.videoSettings;
    const filters = [];

    if (settings.fps !== "original") {
      filters.push(`fps=${settings.fps}`);
    }
    if (settings.height !== "original") {
      filters.push(`scale=-2:${settings.height}`);
    }

    if (filters.length === 0) {
      filters.push('null')
    }
    return filters;
  }

   audio2filters=()=> {
    const audio: AudioSettings = {volume: ProcessStore.volume};
    const filters = [];
    if (audio.volume !== 1) {
      filters.push(`volume=${audio.volume ?? 1}`);
    }

    if (filters.length === 0) {
      filters.push('anull');
    }
    return filters;
  }

   filterComplex=(mediaDetails: FFprobeData)=> {
    const steps: string[] = [];
    const mappings = new Set<string>();

    steps.push(`[0:v]${this.settings2filters().join(',')}[v]`);
    mappings.add('[v]')

     // fixme add audioTrakcIndexes to FFprobeData
    const audioStreamIndexes = ff_getAudioTrackIndexes(mediaDetails);

    if (audioStreamIndexes.length > 0 && ProcessStore.volume > 0) {
      const audioFilters = this.audio2filters();

      const header = audioStreamIndexes.map((i) => `[0:${i}]`).join('');

      if(audioStreamIndexes.length > 1){
        audioFilters.unshift(`amix=${audioStreamIndexes.length}`);
      }

      steps.push(`${header}${audioFilters.join(',')}[a]`)
      mappings.add('[a]');
    }

    return {
      filter_complex: steps,
      mappings: [...mappings]
    };
  }

  generateFFmpegArgs(fileIn: string, range: { begin: number, end: number }, fileOut: string): string[] {
    if(!ProcessStore.videoDetails){
      throw new Error('Cannot continue without video details');
    }

    const fc = this.filterComplex(ProcessStore.videoDetails);
    console.log('filter_complex', fc.filter_complex);
    console.log('filter_complex mappings', fc.mappings);

    return [
      '-ss', range.begin.toFixed(6),
      '-to', range.end.toFixed(6),
      '-i', fileIn,

      ...(fc.filter_complex.length > 0 ? ['-filter_complex', fc.filter_complex.join(';')] : []),
      ...(fc.mappings.length > 0 ? fc.mappings.map(x => ['-map', x]).flat() : []),

      ...this.strategy2params(ProcessStore.videoDetails, range.end - range.begin),
      ...(ProcessStore.volume > 0 ? [] : ['-an']),
      '-c:v', this.processorName,
      fileOut, '-y'
    ];
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
  static readonly benchmarksH264: ({ [s in EncodingSpeedPresetsType]: { fps: number, kbit: number } }) = {
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

  static readonly encodingSpeedPresets: EncodingSpeedPresetsType[] = [
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


