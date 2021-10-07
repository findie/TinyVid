/**
 Copyright Findie 2021
 */
import {action, computed, makeObservable, observable} from "mobx";
import {FFprobe, FFprobeData} from "../../common/ff/ffprobe";
import {AudioSettings, RenderStrategy, VideoSettings} from "../../electron/types";
import {FFmpeg} from "../../common/ff/ffmpeg";
import {ProcessHelpers} from "../../common/process";
import {RendererSettings} from "../helpers/settings";
import {ProcessStore} from "./Process.store";
import {PlaybackStore} from "./Playback.store";
import {eventList} from "../helpers/events";
import FFmpegProcess = FFmpeg.FFmpegProcess;
import ProcessError = ProcessHelpers.ProcessError;

export class QueueItemClass {

  readonly fileIn: string

  @observable
  fileOut: string

  @observable.ref
  videoDetails: FFprobeData | null = null;

  @observable
  video: VideoSettings = RendererSettings.settings.processingVideoSettings

  @observable
  audio: AudioSettings = {
    volume: ProcessStore.volume
  }

  @observable
  strategy: RenderStrategy = RendererSettings.settings.processingStrategy

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

  constructor(
    fileIn: string,
    fileOut: string,
    videoDetails?: FFprobeData
  ) {
    this.fileIn = fileIn;
    this.fileOut = fileOut;

    if (videoDetails) {
      this.videoDetails = videoDetails;
    } else {
      FFprobe.getDetails(fileIn)
        .then(action(d => this.videoDetails = d))
        .catch(action(e => this._error = e));
    }

    makeObservable(this);
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
        video: this.video,
        audio: this.audio,
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
        resolution: this.video.height === 'original' ? this.videoDetails!.height : this.video.height,
        isResolutionChanged: this.video.height !== 'original',
        fps: this.video.fps === 'original' ? this.videoDetails!.fps : this.video.fps,
        isFPSChanged: this.video.fps !== 'original',
        encoderSettings: ProcessStore.processor.settings,
        volume: this.audio.volume,
      });

      this.process = proc;
      proc
        .wait()
        .then(action(() => {
          if (!proc.cancelled) {
            // mark as done if not cancelled
            this._isDone = true;
          } else {
            // once cancelled and done
            // remove proc so we can start it again
            if (this.process === proc) {
              this.process = null;
            }
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
}

class QueueStoreClass {

  @observable
  queue: QueueItemClass[] = [];

  @action
  addToQueue(item: QueueItemClass) {
    this.queue.push(item);
  }

  constructor() {
    makeObservable(this);

    // this.addToQueue(new QueueItemClass(
    //   '/home/stefan/Downloads/redbull_grid.mp4',
    //   '/home/stefan/Downloads/redbull_grid.test.queue.mp4',
    // ));

  }

}

export const QueueStore = new QueueStoreClass();

// @ts-ignore
window.QueueStore = QueueStore;
