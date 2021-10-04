import {FFMpegProgress, IFFMpegProgressData} from "ffmpeg-progress-wrapper";
import {action, computed, makeObservable, observable} from "mobx";
import type {FFMpegError} from "ffmpeg-progress-wrapper/dist/error";
import {FFFiles} from "./files";

/**
 Copyright Findie 2021
 */
export namespace FFmpeg {

  const ffmpeg = FFFiles.ffmpeg;

  export class FFmpegProcess {

    @observable.ref
    protected p: FFMpegProgress | null = null;
    protected donePromise: Promise<string> = Promise.resolve('');

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

      console.log('ffmpeg', this.args);
      this.p.on('raw', console.log);
      this.p.on('progress', action(progress => this.progress = progress));

      this.donePromise = this.p.onDone();
      this.donePromise.then(action(() => this.done = true));
      this.donePromise.catch(action(e => this.error = e));

      return this.donePromise;
    }

    wait = () => this.donePromise;

    @action
    cancel = () => {
      if (this.p && !this.cancelled) {
        this.cancelled = true;
        this.p?.kill('SIGINT');
      }
    }
  }

}
