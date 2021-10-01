/**
 Copyright Findie 2021
 */
import {action, computed, makeObservable, observable, toJS} from "mobx";
import {ResourceHelpers} from "../../../electron/helpers/resources";
import {existsSync, readFileSync, writeFileSync} from "fs";
import {objectMergeDeep} from "../../helpers/js";
import {deepObserve} from "mobx-utils";
import {debounce} from "throttle-debounce";
import {RendererSettings} from "../../helpers/settings";
import {VideoSettings} from "../../../electron/types";
import {DeepReadonly} from "utility-types";
import {FFprobe, FFprobeData} from "../../../common/ff/ffprobe";
import {AppState} from "../AppState.store";

const settings_file = (processors: string) =>
  ResourceHelpers.userData_dir(`processor_${processors.replace(/[^a-z09_]/gi, '_')}_settings.json`);

export type ProcessBaseGenericSettings<PROCESSOR> = {
  processorName: PROCESSOR
  version: number
}

export abstract class ProcessBaseGeneric<PROCESSOR extends string, SETTINGS extends ProcessBaseGenericSettings<PROCESSOR>> {

  readonly processorName: PROCESSOR;

  @computed get strategy() {
    return RendererSettings.settings.processingParams.strategyType;
  }

  @computed get tune() {
    return RendererSettings.settings.processingParams.strategyTune;
  }

  @observable
  settings: SETTINGS;

  protected constructor(processorName: PROCESSOR, defaultSettings: SETTINGS) {
    makeObservable(this);

    this.processorName = processorName;
    this.settings = defaultSettings;

    // load settings in
    const didLoad = this.loadSettings();
    if (!didLoad) {
      // save in case the load has failed and we're using default data
      this.saveSettings();
    }
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
    } catch (e) {
      console.error('failed to save settings file', e);
    }
  }

  abstract generateFFmpegArgs(fileIn: string, range: { begin: number, end: number }, fileOut: string): string[];

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

  static fixTrimRange(videoDetails: FFprobeData, start: number, end: number){
    const frameTime = (1 / (videoDetails?.fps || 60));
    const _start = start + frameTime;
    const _end = Math.max(_start + frameTime, end - frameTime);

    return {
      begin: _start,
      end: _end
    }
  }
}
