import {FFMpegProgress, IFFMpegProgressData} from "ffmpeg-progress-wrapper";
import {action, computed, makeObservable, observable} from "mobx";
import type {FFMpegError} from "ffmpeg-progress-wrapper/dist/error";
import {FFFiles} from "./files";
import {sendToMain} from "../shared-event-comms";
import {ipcRenderer} from "electron";

/**
 Copyright Findie 2021
 */
export namespace FFmpeg {

  const ffmpeg = FFFiles.ffmpeg;

  export class FFmpegProcess {

    @observable.ref
    protected p: FFMpegProgress | null = null;
    protected donePromise: Promise<string | null> = Promise.resolve('');

    @observable.ref
    error: FFMpegError | null = null;

    @observable.ref
    progress: IFFMpegProgressData | null = null;

    @observable done: boolean = false;
    @observable cancelled: boolean = false;

    @computed get started() {
      return !!this.p;
    }

    readonly args: string[];
    readonly duration: number;

    constructor(args: string[], duration: number) {
      makeObservable(this);
      this.args = args;
      this.duration = duration;
    }

    @action
    run = () => {
      if (this.p) {
        throw new Error('Process already started');
      }

      this.p = new FFMpegProgress(this.args,
        {
          duration: this.duration,
          cmd: ffmpeg,
          hideFFConfig: true
        }
      );

      sendToMain(ipcRenderer, 'register-ffmpeg', this.p.process.pid);

      console.log('Spawning', 'ffmpeg', this.args.join(' '));
      this.p.on('raw', console.log);
      this.p.on('progress', action(progress => this.progress = progress));

      this.donePromise = this.wrapDonePromise(this.p.onDone());
      this.donePromise.then(action(() => {
        this.done = true;
      }));
      this.donePromise.catch(action(e => {
        this.done = true;

        if (!this.cancelled) {
          this.error = e
        }
      }));

      return this.donePromise;
    }

    // this wrap will not throw if process has been cancelled
    private wrapDonePromise = async (promise: Promise<string>): Promise<string | null> => {
      try {
        return await promise;
      } catch (e) {
        if (this.cancelled) {
          return null;
        }
        throw e;
      }
    }

    wait = () => this.donePromise;

    @action
    cancel = () => {
      if (this.p && !this.cancelled) {
        this.cancelled = true;
        this.p?.stop();
      }
    }
  }

}
