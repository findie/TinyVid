import {FFMpegProgress, IFFMpegProgressData} from "ffmpeg-progress-wrapper";
import {action, makeObservable, observable} from "mobx";
import type {FFMpegError} from "ffmpeg-progress-wrapper/dist/error";
import {ResourceHelpers} from "../../electron/helpers/resources";

/**
 Copyright Findie 2021
 */
export namespace FFmpeg {

  const ffmpeg = ResourceHelpers.bin_dir('ffmpeg');

  export class FFmpegProcess {

    protected p: FFMpegProgress | null = null;
    protected donePromise: Promise<string> = Promise.resolve('');

    @observable.ref error: FFMpegError | null = null;

    @observable.ref progress: IFFMpegProgressData | null = null;

    @observable done: boolean = false;
    @observable cancelled: boolean = false;

    readonly args: string[];
    readonly duration: number;

    get hasStarted() {
      return !!this.p;
    }

    constructor(args: string[], duration: number) {
      makeObservable(this);
      this.args = args;
      this.duration = duration;
    }

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
