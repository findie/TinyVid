import {action, computed, makeObservable, observable, reaction} from "mobx";
import {ErrorLike} from "../electron/protocols/base-protocols";
import {DetailsProtocol} from "../electron/protocols/proto/details";
import {DetailsComms, TrimComms} from "./helpers/comms";
import {AppState} from "./AppState.store";
import {RenderStrategy} from "../electron/types";
import {ConfigMaxFileSizeDefaultSize, ConfigMaxFileSizeDefaultSpeedOrQuality} from "./config/max-file-size";
import {
  ConfigConstantQualityDefaultQuality,
  ConfigConstantQualityDefaultSpeedOrQuality
} from "./config/constant-quality";
import {ConfigVideoSettingsData} from "./config/video-settings";
import {remote} from "electron";
import {RendererFileHelpers} from "./helpers/file";
import {eventList} from "./helpers/events";
import {FFHelpers} from "../electron/helpers/ff";
import {clip} from "./helpers/math";
import {PlaybackStore} from "./Playback.store";

/**
 Copyright Findie 2021
 */

const defaultMaxFileSizeStrategy: RenderStrategy = {
  type: 'max-file-size',
  tune: ConfigMaxFileSizeDefaultSize,
  speed: ConfigMaxFileSizeDefaultSpeedOrQuality
}
const defaultConstantQuality: RenderStrategy = {
  type: 'constant-quality',
  tune: ConfigConstantQualityDefaultQuality,
  speed: ConfigConstantQualityDefaultSpeedOrQuality
}

class ProcessStoreClass {
  @observable error: Error | ErrorLike | null = null;
  @action setError = (e: ProcessStoreClass['error']) => this.error = e;

  @observable videoDetails: null | DetailsProtocol.DetailsProtocolResponse = null;
  @action setVideoDetails = (d: ProcessStoreClass['videoDetails']) => this.videoDetails = d;

  @computed get simpleVideoDetails() {
    if (!this.videoDetails) return null;
    return DetailsComms.simplifyMediaDetails(this.videoDetails);
  }

  @observable processingID: string | null = null;
  @action setProcessingID = (pid: string | null) => this.processingID = pid;

  @observable strategyType: RenderStrategy['type'] = defaultMaxFileSizeStrategy.type;
  @observable strategyTune: RenderStrategy['tune'] = defaultMaxFileSizeStrategy.tune;
  @observable strategySpeed: RenderStrategy['speed'] = defaultMaxFileSizeStrategy.speed;
  @action setStrategyType = (t: ProcessStoreClass['strategyType']) => {
    this.strategyType = t;
    this.strategyTune = t === 'max-file-size' ?
      defaultMaxFileSizeStrategy.tune :
      defaultConstantQuality.tune
  }
  @action setStrategyTune = (t: ProcessStoreClass['strategyTune']) => this.strategyTune = t;
  @action setStrategySpeed = (s: ProcessStoreClass['strategySpeed']) => this.strategySpeed = s;

  @computed get strategy(): RenderStrategy {
    return {
      type: this.strategyType,
      tune: this.strategyTune,
      speed: this.strategySpeed
    }
  }

  @observable videoSettings: ConfigVideoSettingsData = { fps: 'original', height: 'original' }
  @action setVideoSettings = (vs: ProcessStoreClass['videoSettings']) => this.videoSettings = vs;

  @observable fileOut: string = '';
  @action setFileOut = (f: string) => this.fileOut = f;

  @observable volume: number = 1;
  @action setVolume = (v: number) => {
    v = clip(0, v, 2);
    PlaybackStore.setVolume(v);
    return this.volume = v;
  }

  constructor() {
    makeObservable(this);

    reaction(() => AppState.file, (file) => {
      this.setVideoDetails(null);
      if (!file) {
        return;
      }

      DetailsComms.getDetails(file)
        .then(this.setVideoDetails)
        .catch(this.setError);
    });

    reaction(() => this.error, (e) => {
      if (e) {
        this.setProcessingID(null);
        AppState.setFile('');
      }
    })
  }

  startProcessing = async () => {
    if (!AppState.file) {
      return console.warn('refusing to start process with empty video field');
    }
    const strategy = ProcessStore.strategy;
    PlaybackStore.pause();

    const fout = remote.dialog.showSaveDialogSync(
      remote.getCurrentWindow(),
      {
        title: 'Output location',
        defaultPath: RendererFileHelpers.generateFileOutName(AppState.file, AppState.trimRange, strategy, ProcessStore.videoSettings),
        buttonLabel: 'Save & Start',
        filters: [{ name: 'Video', extensions: ['mp4'] }],
        properties: ['createDirectory', 'showOverwriteConfirmation']
      });

    if (!fout) {
      return console.warn('refusing to start process with empty output location');
    }

    // box in the range by one frame to account for browser frame inaccuracy
    const frameTime = (1 / (this.simpleVideoDetails?.fps || 60));
    const start = AppState.trimRange.start + frameTime;
    const end = Math.max(start + frameTime, AppState.trimRange.end - frameTime);

    try {
      const data = await TrimComms.startProcess(
        AppState.file,
        fout,
        { start, end },
        strategy,
        this.videoSettings,
        { volume: this.volume }
      );

      eventList.global.process({
        type: strategy.type,
        tune: strategy.tune,
        resolution: this.videoSettings.height === 'original' ? this.simpleVideoDetails!.height : this.videoSettings.height,
        isResolutionChanged: this.videoSettings.height !== 'original',
        fps: this.videoSettings.fps === 'original' ? this.simpleVideoDetails!.fps : this.videoSettings.fps,
        isFPSChanged: this.videoSettings.fps !== 'original',
        processSpeed: FFHelpers.encodingSpeedPresets[strategy.speed],
      });

      this.setFileOut(fout);
      this.setProcessingID(data.id);
    } catch (e) {
      this.setError(e);
    }
  }

}

export const ProcessStore = new ProcessStoreClass();

// @ts-ignore
window.ProcessStore = ProcessStore;
