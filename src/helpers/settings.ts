import {existsSync, readFileSync, writeFileSync} from "fs";
import {ResourceHelpers} from "../../electron/helpers/resources";
import {ThemeNames} from "./theme";
import {action, makeObservable, observable, reaction, toJS} from "mobx";
import {debounce} from "throttle-debounce";
import {v4 as uuid} from 'uuid';
import {deepObserve} from "mobx-utils";
import {RenderStrategy, VideoSettings} from "../../electron/types";
import {objectMergeDeep} from "./js";
import {FFHelpers} from "../../electron/helpers/ff";

export const ConfigMaxFileSizeDefaultSize = 8;
export const ConfigMaxFileSizeDefaultSpeedOrQuality = FFHelpers.encodingSpeedPresets.indexOf('medium');

export const ConfigConstantQualityDefaultQuality = 22;
export const ConfigConstantQualityDefaultSpeedOrQuality = FFHelpers.encodingSpeedPresets.indexOf('medium');

export interface RendererSettings {
  theme: ThemeNames
  readonly ID: string

  processingParams: {
    strategyType: RenderStrategy['type']
    strategyTune: RenderStrategy['tune']
    strategySpeed: RenderStrategy['speed']
  }

  processingVideoSettings: VideoSettings
}

class RendererSettingsClass {

  // default settings (they are overwritten from JSON at init)
  @observable readonly settings: RendererSettings = {
    theme: "dark",

    ID: uuid(),

    processingParams: {
      strategyType: 'max-file-size',
      strategyTune: ConfigMaxFileSizeDefaultSize,
      strategySpeed: ConfigMaxFileSizeDefaultSpeedOrQuality
    },

    processingVideoSettings: {
      fps: "original",
      height: "original"
    }
  }

  readonly settings_file = ResourceHelpers.userData_dir('renderer_settings.json');

  @action
  load = () => {
    if (!existsSync(this.settings_file)) {
      return false;
    }

    console.log('loading settings from', this.settings_file);
    try {
      objectMergeDeep(
        this.settings,
        JSON.parse(readFileSync(this.settings_file).toString())
      );
    } catch (e) {
      console.error('failed to load settings file', e);
      return false;
    }
    return true;
  }

  save = () => {
    console.log('saving settings from', this.settings_file);
    try {
      writeFileSync(this.settings_file, JSON.stringify(toJS(this.settings)));
    } catch (e) {
      console.error('failed to save settings file', e);
    }
  }

  constructor() {
    makeObservable(this);
    // load settings in
    const didLoad = this.load();
    if (!didLoad) {
      // save in case the load has failed and we're using default data
      this.save();
    }

    deepObserve(
      this.settings,
      debounce(500, false, this.save)
    );

    reaction(
      () => this.settings.processingParams.strategyType,
      (type, prevType) => {
        if(!prevType) return;

        if(type===prevType){
          return;
        }

        this.settings.processingParams.strategyTune = type === 'max-file-size' ?
          ConfigMaxFileSizeDefaultSize :
          ConfigConstantQualityDefaultQuality
      },
      { fireImmediately: true }
    );

    reaction(() => this.settings.processingParams.strategyTune, (arg, prev, r) => {
      console.trace('tune changed', arg, prev);
    });

    console.log('tune is', this.settings.processingParams.strategyTune);
  }
}

export const RendererSettings = new RendererSettingsClass();

if ('window' in global) {
  // @ts-ignore
  window.RendererSettings = RendererSettings;
}
