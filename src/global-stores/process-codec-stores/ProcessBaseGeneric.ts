/**
 Copyright Findie 2021
 */
import {action, makeObservable, observable, toJS} from "mobx";
import {ResourceHelpers} from "../../../electron/helpers/resources";
import {existsSync, readFileSync, writeFileSync} from "fs";
import {objectMergeDeep} from "../../helpers/js";
import {deepObserve} from "mobx-utils";
import {debounce} from "throttle-debounce";
import {AudioSettings, RenderStrategy, VideoSettings} from "../../../electron/types";
import {DeepReadonly} from "utility-types";
import {FFprobeData} from "../../../common/ff/ffprobe";

const settings_file = (processors: string) =>
  ResourceHelpers.userData_dir(`processor_${processors.replace(/[^a-z0-9_]/gi, '_')}_settings.json`);

export type ProcessBaseGenericSettings<PROCESSOR> = {
  processorName: PROCESSOR
  version: number
}

export type RenderingSettings = {
  video: VideoSettings,
  audio: AudioSettings,
  strategy: RenderStrategy
}

// https://github.com/mobxjs/mobx/blob/main/docs/subclassing.md

export abstract class ProcessBaseGeneric<PROCESSOR extends string, SETTINGS extends ProcessBaseGenericSettings<PROCESSOR>> {

  @observable
  readonly processorName: PROCESSOR;

  @observable.ref
  abstract readonly qualityOptions: { text: string, value: number, default?: boolean }[];
  abstract readonly qualityUnit: string;

  @observable
  settings: SETTINGS;

  protected constructor(processorName: PROCESSOR, defaultSettings: SETTINGS) {

    this.processorName = processorName;
    this.settings = defaultSettings;

    // load settings in
    const didLoad = this.loadSettings();
    if (!didLoad) {
      // save in case the load has failed and we're using default data
      this.saveSettings();
    }

    makeObservable(this, {
      processorName: observable,
      qualityOptions: observable.ref,
      settings: observable,
    });


    deepObserve(
      this.settings,
      debounce(500, false, this.saveSettings)
    );
  }

  @action
  private loadSettings = () => {
    const file = settings_file(this.processorName);

    if (!existsSync(file)) {
      return false;
    }
    console.log('loading processor settings from', file);
    try {

      const loadedSettings: ProcessBaseGenericSettings<PROCESSOR> = JSON.parse(readFileSync(file).toString());

      if (this.settings.processorName !== loadedSettings.processorName) {
        console.log('failed to load processor settings as it\'s different processor name from what\'s loaded');
        return false;
      }
      if (this.settings.version !== loadedSettings.version) {
        console.log('failed to load processor settings as it\'s different version from what\'s loaded');
        return false;
      }

      objectMergeDeep(
        this.settings,
        loadedSettings,
        { replaceArrays: true }
      );
    } catch (e) {
      console.error('failed to load settings file', e);
      return false;
    }
    return true;
  }

  protected saveSettings = () => {
    const file = settings_file(this.processorName);

    try {
      writeFileSync(file, JSON.stringify(toJS(this.settings)));
      console.log('processor', this.processorName, 'settings successfully saved at', file);
    } catch (e) {
      console.error('failed to save settings file', e);
    }
  }

  computeAverageBPS(fileSizeInBytes: number, durationInSeconds: number, hasAudio: boolean) {
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

  abstract optimalBitrateCalculator(
    videoDetails: { width: number, height: number, fps: number },
    outputSettings: VideoSettings
  ): DeepReadonly<{
    mayCorrupt: [number, number],
    veryBad: [number, number],
    blockingArtifacts: [number, number],
    good: [number, number],
    diminishingReturns: [number, number],
    wastedSpace: [number, number]
  }>

  protected audioFilters(settings: RenderingSettings) {
    const audio: AudioSettings = { volume: settings.audio.volume };
    const filters = [];
    if (audio.volume !== 1) {
      filters.push(`volume=${audio.volume ?? 1}`);
    }

    if (filters.length === 0) {
      filters.push('anull');
    }
    return filters;
  }

  protected videoFilters({ video: settings }: RenderingSettings) {
    const filters = [];

    if (settings.fps !== "original") {
      filters.push(`fps=${settings.fps}`);
    }
    if (settings.height !== "original") {
      filters.push(`scale=-2:${settings.height}`);
    }

    if (filters.length === 0) {
      filters.push('null');
    }
    return filters;
  }

  protected filterComplex(mediaDetails: FFprobeData, settings: RenderingSettings) {
    const steps: string[] = [];
    const mappings = new Set<string>();

    steps.push(`[0:v]${this.videoFilters(settings).join(',')}[v]`);
    mappings.add('[v]')

    if (mediaDetails.audioTrackIndexes.length > 0 && settings.audio.volume > 0) {
      const audioFilters = this.audioFilters(settings);

      const header = mediaDetails.audioTrackIndexes.map((i) => `[0:${i}]`).join('');

      if (mediaDetails.audioTrackIndexes.length > 1) {
        audioFilters.unshift(`amix=${mediaDetails.audioTrackIndexes.length}`);
      }

      steps.push(`${header}${audioFilters.join(',')}[a]`)
      mappings.add('[a]');
    }

    return {
      filter_complex: steps,
      mappings: [...mappings]
    };
  }

  protected abstract paramsFromStrategy(details: FFprobeData, durationOrTrimmedDuration: number, settings: RenderingSettings): string[];

  public generateFFmpegArgs(
    fileIn: string,
    range: { begin: number, end: number },
    fileOut: string,
    videoDetails: FFprobeData,
    renderSettings: RenderingSettings
  ): string[] {

    const fc = this.filterComplex(videoDetails, renderSettings);
    console.log('filter_complex', fc.filter_complex);
    console.log('filter_complex mappings', fc.mappings);

    return [
      ...(range.begin !== 0 ?
          ['-ss', range.begin.toFixed(6)] :
          []
      ),
      '-to', range.end.toFixed(6),
      '-i', fileIn,

      ...(fc.filter_complex.length > 0 ? ['-filter_complex', fc.filter_complex.join(';')] : []),
      ...(fc.mappings.length > 0 ? fc.mappings.map(x => ['-map', x]).flat() : []),

      ...this.paramsFromStrategy(videoDetails, range.end - range.begin, renderSettings),
      ...(renderSettings.audio.volume > 0 ? [] : ['-an']),
      '-c:v', this.processorName,
      fileOut, '-y'
    ];
  }

  static fixTrimRange(videoDetails: FFprobeData, start: number, end: number) {
    const frameTime = (1 / (videoDetails?.fps || 60));
    const _start = start + frameTime;
    const _end = Math.max(_start + frameTime, end - frameTime);

    return {
      begin: _start,
      end: _end
    }
  }

}
