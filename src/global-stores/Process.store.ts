import {action, computed, makeObservable, observable, reaction} from "mobx";
import {ErrorLike} from "../../electron/protocols/base-protocols";
import {AppState} from "./AppState.store";
import {RenderStrategy} from "../../electron/types";
import {getCurrentWindow} from '@electron/remote';
import {RendererFileHelpers} from "../helpers/file";
import {eventList} from "../helpers/events";
import {clip} from "../helpers/math";
import {PlaybackStore} from "./Playback.store";
import {RendererSettings} from "../helpers/settings";
import {FFprobe, FFprobeData} from "../../common/ff/ffprobe";
import {ProcessBaseGeneric, ProcessBaseGenericSettings} from "./process-codec-stores/ProcessBaseGeneric";
import {Processors} from "./process-codec-stores";
import {FFmpeg} from "../../common/ff/ffmpeg";
import {IProcessContext} from "./contexts/Process.context";


/**
 Copyright Findie 2021
 */

export class ProcessStoreClass implements IProcessContext {
  @observable error: Error | ErrorLike | null = null;
  @action setError = (e: ProcessStoreClass['error']) => this.error = e;

  @observable.ref videoDetails: null | FFprobeData = null;
  @action setVideoDetails = (d: ProcessStoreClass['videoDetails']) => this.videoDetails = d;

  // fixme this looks like it's not observable :(
  @observable.ref
  processor: ProcessBaseGeneric<string, ProcessBaseGenericSettings<string>>;
  @action setProcessor = (processor: keyof typeof Processors) => this.processor = new Processors[processor]();

  @observable processing: FFmpeg.FFmpegProcess | null = null;
  @action setProcessing = (p: ProcessStoreClass['processing']) => this.processing = p;

  @computed get strategyType() {
    return RendererSettings.settings.processingStrategy.type;
  }

  @computed get strategyTune() {
    return RendererSettings.settings.processingStrategy.tune;
  }

  @action setStrategyType = (t: ProcessStoreClass['strategyType']) =>
    RendererSettings.settings.processingStrategy.type = t;
  @action setStrategyTune = (t: ProcessStoreClass['strategyTune']) =>
    RendererSettings.settings.processingStrategy.tune = t;

  @computed get strategy(): RenderStrategy {
    return {
      type: this.strategyType,
      tune: this.strategyTune,
    }
  }

  @computed get videoSettings() {
    return RendererSettings.settings.processingVideoSettings;
  }

  @action setVideoSettings = <K extends keyof ProcessStoreClass['videoSettings']>(key: K, val: ProcessStoreClass['videoSettings'][K]) => {
    RendererSettings.settings.processingVideoSettings[key] = val;
  }

  // todo move this into an AudioSettings in RendererSettings
  @observable audioSettings = {
    volume: 1
  }
  @action setAudioSettings = <K extends keyof ProcessStoreClass['audioSettings']>(key: K, val: ProcessStoreClass['audioSettings'][K]) => {
    this.audioSettings[key] = val;
  }

  @observable fileOut: string | null = null;
  @action setFileOut = (f: ProcessStoreClass['fileOut']) => this.fileOut = f;

  constructor() {
    makeObservable(this);

    reaction(() => AppState.file, (file) => {
      this.setVideoDetails(null);
      if (!file) {
        return;
      }

      FFprobe.getDetails(file)
        .then(this.setVideoDetails)
        .catch(this.setError);
    });

    reaction(() => this.error, (e) => {
      if (e) {
        this.setProcessing(null);
        AppState.setFile('');
      }
    });

    this.processor = new (
      Processors[RendererSettings.settings.processor] ||
      Processors['libx264']
    )();
    reaction(() => RendererSettings.settings.processor, (p) => {
      this.setProcessor(p);

      if (RendererSettings.settings.processingStrategy.type === 'constant-quality') {
        const defaultCRF = this.processor.qualityOptions.find(x => x.default)?.value;
        RendererSettings.settings.processingStrategy.tune = clip(
          this.processor.qualityOptions[0].value,
          defaultCRF ?? RendererSettings.settings.processingStrategy.tune,
          this.processor.qualityOptions[this.processor.qualityOptions.length - 1].value,
        );
      }
    });

    reaction(() => this.processing?.error, (e) => {
      if (e) {
        getCurrentWindow().setProgressBar(1, { mode: "error" });
      }
    });

    reaction(() => this.processing?.progress, (p) => {
      if (p && (p.progress ?? 0) > 0) {
        getCurrentWindow().setProgressBar(
          p.progress || 0,
          {
            mode: "normal"
          }
        );
      }
    });

    reaction(() => this.processing?.done, (done) => {
      if (done) {
        getCurrentWindow().setProgressBar(-1, { mode: "none" });
      }
    });

    reaction(() => this.processing, (p) => {
      if (!p) {
        getCurrentWindow().setProgressBar(0, { mode: "none" });
      }
    });
  }

  startProcessing = async () => {
    if (!AppState.file) {
      return console.warn('refusing to start process with empty video field');
    }
    if (!this.videoDetails) {
      return console.warn('refusing to start process with empty video details');
    }

    const strategy = ProcessStore.strategy;
    PlaybackStore.pause();

    const { canceled, filePath: fout } = await RendererFileHelpers.requestFileSaveDialog(
      RendererFileHelpers.generateFileOutName(AppState.file, AppState.trimRange, strategy, ProcessStore.videoSettings)
    );

    if (!fout || canceled) {
      return console.warn('refusing to start process with empty output location');
    }

    // box in the range by one frame to account for browser frame inaccuracy
    const fixedRange = ProcessBaseGeneric.fixTrimRange(this.videoDetails, AppState.trimRange.start, AppState.trimRange.end);

    const args = this.processor.generateFFmpegArgs(
      AppState.file,
      fixedRange,
      fout,
      this.videoDetails,
      {
        video: this.videoSettings,
        audio: this.audioSettings,
        strategy: RendererSettings.settings.processingStrategy
      }
    );

    try {

      const proc = new FFmpeg.FFmpegProcess(
        args,
        fixedRange.end - fixedRange.begin
      );

      this.setProcessing(proc);
      proc.run().catch(console.error);

      eventList.global.process({
        type: strategy.type,
        tune: strategy.tune,
        resolution: this.videoSettings.height === 'original' ? this.videoDetails!.height : this.videoSettings.height,
        isResolutionChanged: this.videoSettings.height !== 'original',
        fps: this.videoSettings.fps === 'original' ? this.videoDetails!.fps : this.videoSettings.fps,
        isFPSChanged: this.videoSettings.fps !== 'original',
        encoderSettings: this.processor.settings,
        volume: this.audioSettings.volume,
      });

      this.setFileOut(fout);
    } catch (e) {
      this.setError(e);
    }
  }

}

export const ProcessStore = new ProcessStoreClass();

// @ts-ignore
window.ProcessStore = ProcessStore;
