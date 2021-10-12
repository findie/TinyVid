/**
 Copyright Findie 2021
 */
import {action, computed, makeObservable, observable, reaction, toJS} from "mobx";
import {FFprobe, FFprobeData} from "../../common/ff/ffprobe";
import {AudioSettings, RenderStrategy, VideoSettings} from "../../electron/types";
import {FFmpeg} from "../../common/ff/ffmpeg";
import {ProcessHelpers} from "../../common/process";
import {ConfigConstantQualityDefaultQuality, RendererSettings} from "../helpers/settings";
import {ProcessStore} from "./Process.store";
import {PlaybackStore} from "./Playback.store";
import {eventList} from "../helpers/events";
import {IProcessContext} from "./contexts/Process.context";
import {b2text, bps2text, seconds2time} from "../helpers/math";
import {RendererFileHelpers} from "../helpers/file";
import {existsSync} from "fs";
import {noop} from "../helpers/js";
import {shell} from "@electron/remote";
import FFmpegProcess = FFmpeg.FFmpegProcess;
import ProcessError = ProcessHelpers.ProcessError;

export class QueueItemClass implements IProcessContext {

  readonly fileIn: string

  @observable
  fileOut: string
  @observable
  fileOutAlreadyExists: boolean = false;

  @observable.ref
  videoDetails: FFprobeData | null = null;

  @observable
  videoSettings: VideoSettings = RendererSettings.settings.processingVideoSettings;
  @action
  setVideoSettings = <K extends keyof IProcessContext["videoSettings"]>(key: K, val: IProcessContext["videoSettings"][K]) => {
    this.videoSettings[key] = val;
  }

  @computed get isVideoSettingsLocked() {
    return this.videoSettings === RendererSettings.settings.processingVideoSettings;
  }

  @action toggleVideoSettingsLock = () => {
    if (this.isVideoSettingsLocked) {
      this.videoSettings = toJS(this.videoSettings);
    } else {
      this.videoSettings = RendererSettings.settings.processingVideoSettings;
    }
  }

  // todo move to RendererSettings.settings.audioSettings
  @observable
  audioSettings: AudioSettings = ProcessStore.audioSettings
  @action
  setAudioSettings = <K extends keyof IProcessContext["audioSettings"]>(key: K, val: IProcessContext["audioSettings"][K]) => {
    this.audioSettings[key] = val;
  }

  @observable
  strategy: RenderStrategy = RendererSettings.settings.processingStrategy
  @action setStrategyType = (type: RenderStrategy["type"]) => {

    if (this.strategy.type !== type) {

      if (type === ProcessStore.strategy.type) {
        this.strategy.tune = toJS(ProcessStore.strategy.tune);
      } else {

        // fixme DRY this and the reaction in RendererSettings on RendererSettings.settings.processingStrategy.type
        if (type === 'constant-quality') {
          this.strategy.tune = (
            ProcessStore.processor.qualityOptions.find(x => x.default) ||
            ProcessStore.processor.qualityOptions[0]
          )?.value ?? ConfigConstantQualityDefaultQuality;
        } else if (type === 'max-file-size') {
          this.strategy.tune = RendererSettings.settings.UI.fileSizePresets[0].size ?? 8;
        }
      }

    }

    this.strategy.type = toJS(type);

  }
  @action setStrategyTune = (tune: RenderStrategy["tune"]) => this.strategy.tune = tune;

  @computed get isStrategyLocked() {
    return this.strategy === RendererSettings.settings.processingStrategy;
  }

  @action toggleStrategyLock = () => {
    if (this.isStrategyLocked) {
      this.strategy = toJS(this.strategy);
    } else {
      this.strategy = RendererSettings.settings.processingStrategy;
    }
  }

  @observable.ref
  process: FFmpegProcess | null = null;

  @observable
  private _isDone: boolean = false;

  @computed get isDone() {
    return this._isDone || this.process?.done;
  }

  @observable
  private _error: Error | ProcessError | null = null;

  @computed get error() {
    return this._error || this.process?.error;
  }

  @computed get statusText(): string {
    if (this.error && !this.process?.cancelled) {
      return 'Errored';
    }
    if (!this.videoDetails) {
      return 'Reading file...';
    }
    if (this.process?.cancelled) {
      return 'Cancelled';
    }
    if (this.process?.done) {
      return 'Done';
    }
    if (this.process?.started) {
      const progress = this.process.progress;
      if (!progress) {
        return 'Starting process';
      }

      return `
${((this.process?.progress?.progress ?? 0) * 100).toFixed(1)}%\
 in \
${(this.process?.progress?.eta ?? 0) > 10 ? seconds2time(this.process?.progress?.eta ?? 0, 0, true) : 'a few seconds'}\
 | \
Size: ${b2text(this.process?.progress?.size ?? 0)}\
 \
Speed: ${(this.process?.progress?.speed || 0).toFixed(2)}x\
 \
Bitrate: ${bps2text(this.process?.progress?.bitrate ?? 0)}\
`;
    }
    return 'Waiting';
  }

  @computed get isRunning() {
    if (!this.process) return false;
    return !this.process.done;
  }

  constructor(
    fileIn: string,
    fileOut: string,
    videoDetails?: FFprobeData
  ) {
    this.fileIn = fileIn;
    this.fileOut = fileOut;
    this.fileOutAlreadyExists = existsSync(fileOut);

    if (videoDetails) {
      this.videoDetails = videoDetails;
    } else {
      FFprobe.getDetails(fileIn)
        .then(action(d => this.videoDetails = d))
        .catch(action(e => this._error = e));
    }

    makeObservable(this);

    reaction(
      () => this.fileOut,
      action((f) => {
        this.fileOutAlreadyExists = existsSync(f);
      })
    );
  }

  @action
  rearm = () => {
    this.process = null;
  }

  @action
  startProcess = () => {
    if (!this.videoDetails) {
      return false;
    }
    if (this.process) {
      return false;
    }

    // todo move this close to UI so we don't have side effects here
    PlaybackStore.pause();

    // todo: add trimming support
    // const fixedRange = ProcessBaseGeneric.fixTrimRange(this.videoDetails, AppState.trimRange.start, AppState.trimRange.end);

    const range = { begin: 0, end: this.videoDetails.duration };

    const args = ProcessStore.processor.generateFFmpegArgs(
      this.fileIn,
      range,
      this.fileOut,
      this.videoDetails,
      {
        video: this.videoSettings,
        audio: this.audioSettings,
        strategy: this.strategy
      }
    );

    try {

      const proc = new FFmpeg.FFmpegProcess(
        args,
        range.end - range.begin
      );

      proc.run().catch(console.error);

      eventList.global.process({
        type: this.strategy.type,
        tune: this.strategy.tune,
        resolution: this.videoSettings.height === 'original' ? this.videoDetails!.height : this.videoSettings.height,
        isResolutionChanged: this.videoSettings.height !== 'original',
        fps: this.videoSettings.fps === 'original' ? this.videoDetails!.fps : this.videoSettings.fps,
        isFPSChanged: this.videoSettings.fps !== 'original',
        encoderSettings: ProcessStore.processor.settings,
        volume: this.audioSettings.volume,
      });

      this.process = proc;
      proc
        .wait()
        .finally(action(() => {
          if (!proc.cancelled) {
            // mark as done if not cancelled
            this._isDone = true;
          }
        }))
      return true;
    } catch (e) {
      this._error = e;
      return false;
    }
  }

  cancel = () => {
    this.process?.cancel();
  }

  requestOutputChange = async () => {
    const { canceled, filePath } = await RendererFileHelpers.requestFileSaveDialog(this.fileOut);

    if (!canceled && filePath) {
      action(() => {
        this.fileOut = filePath;
      })();
    }
  }

  requestOutputPlayback = async () => {
    return shell.openPath(this.fileOut);
  }
}

class QueueStoreClass {

  @observable
  queue: QueueItemClass[] = [];

  @action
  addToQueue = (item: QueueItemClass) => {
    this.queue.push(item);
  }

  addFilePath = (fp: string) => {
    return this.addToQueue(new QueueItemClass(
      fp,
      RendererFileHelpers.generateFileOutName(
        fp,
        { start: 0, end: 0 },
        ProcessStore.strategy,
        ProcessStore.videoSettings
      )
    ));
  }

  @action
  remove = (item: QueueItemClass) => {
    const index = this.queue.indexOf(item);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }
  }

  @computed get isRunning() {
    return !!this.runningItem;
  }

  @computed get runningItem() {
    return this.queue.find(x => x.isRunning);
  }

  constructor() {
    makeObservable(this);
  }

  start = () => {
    if (this.runningItem) return;

    const item = this.queue.find(x => !x.isDone && x.videoDetails);

    if (!item) return;

    const started = item.startProcess();

    if (started) {
      item.process!
        .wait()
        .catch(noop)
        .finally(() => {
          if (item.process!.cancelled) {
            // don't continue
            item.rearm();
            return;
          }
          return this.start();
        });
    }
  }

  stop = () => {
    this.runningItem?.cancel();
  }


}

export const QueueStore = new QueueStoreClass();

// @ts-ignore
window.QueueStore = QueueStore;
