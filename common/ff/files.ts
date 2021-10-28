import {ResourceHelpers} from "../../electron/helpers/resources";
import {existsSync} from "fs";
import * as ffbin from "ffbinaries";
import {downloadBinaries} from "ffbinaries";
import * as path from "path";
import {isWindows} from "../../electron/helpers";
import {action, computed, makeObservable, observable} from "mobx";
import userData_dir = ResourceHelpers.userData_dir;

/**
 Copyright Findie 2021
 */

const FFMPEG_BIN_FILE = isWindows ? 'ffmpeg.exe' : 'ffmpeg';
const FFPROBE_BIN_FILE = isWindows ? 'ffprobe.exe' : 'ffprobe';

export class FFFilesClass {

  @observable
  ffmpeg = ResourceHelpers.bin_dir(FFMPEG_BIN_FILE);
  @observable
  ffprobe = ResourceHelpers.bin_dir(FFPROBE_BIN_FILE);

  @computed
  get ffmpegExists() {
    return existsSync(this.ffmpeg);
  }

  @computed
  get ffprobeExists() {
    return existsSync(this.ffprobe);
  }

  @action
  setFFmpeg = (path: string) => {
    this.ffmpeg = path;
  }

  @action
  setFFprobe = (path: string) => {
    this.ffprobe = path;
  }

  constructor() {
    makeObservable(this);

    if (!this.ffmpegExists || !this.ffprobeExists) {
      this.switchToBackup();
    }
  }

  @action
  protected switchToBackup() {
    this.ffmpeg = userData_dir('bins', FFMPEG_BIN_FILE);
    this.ffprobe = userData_dir('bins', FFPROBE_BIN_FILE);
    console.log('switched ffmpeg to', this.ffmpeg);
    console.log('switched ffprobe to', this.ffprobe);
  }

  downloadBin = async (which: 'ffmpeg' | 'ffprobe', progress: (p: number) => void) => {
    return new Promise((res, rej) => {
      downloadBinaries(which, {
        force: true,
        tickerInterval: 250,
        destination: path.dirname(this.ffmpeg),
        tickerFn: tickData => {
          progress(tickData.progress);
        }
      }, (error, results) => {

        if (error) {
          // check if error is already Error
          // i don't trust the types
          const err: Error = (error as any) instanceof Error ? error as unknown as Error : new Error(error);
          return rej(err);
        }

        return res(results);
      });
    });
  }

  @observable
  downloadProgress = { ffmpeg: 0, ffprobe: 0 };
  @observable
  downloading = false;
  @observable
  downloadError: Error | null = null;
  @observable
  downloadDone = false;

  downloadBins = async () => {
    if (this.downloading) return false;

    action(() => {
      this.downloading = true;
      this.downloadProgress = { ffprobe: 0, ffmpeg: 0 };
    })();
    try {
      await Promise.all([
        this.downloadBin('ffmpeg', action(p => this.downloadProgress.ffmpeg = p)),
        this.downloadBin('ffprobe', action(p => this.downloadProgress.ffprobe = p))
      ]);

      action(() => this.downloadDone = true)();
      return true;
    } catch (e) {
      console.error(e);
      action(() => this.downloadError = e)();
    } finally {
      action(() => this.downloading = false)();
      ffbin.clearCache();
    }
  }
}

export const FFFiles = new FFFilesClass();

// @ts-ignore
window.FFiles = FFFiles;

// @ts-ignore
window.ffbin = ffbin
