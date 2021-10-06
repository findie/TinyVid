import {existsSync, readFileSync, writeFileSync} from "fs";
import {ResourceHelpers} from "../../electron/helpers/resources";
import type {ThemeNames} from "./theme";
import {action, makeObservable, observable, reaction, toJS} from "mobx";
import {debounce} from "throttle-debounce";
import {v4 as uuid} from 'uuid';
import {deepObserve} from "mobx-utils";
import type {RenderStrategy, VideoSettings} from "../../electron/types";
import {objectMergeDeep} from "./js";
import type {Processors} from "../global-stores/process-codec-stores";

export const ConfigMaxFileSizeDefaultSize = 8;
export const ConfigConstantQualityDefaultQuality = 22;

export interface RendererSettings {
  theme: ThemeNames
  readonly ID: string

  processingParams: {
    strategyType: RenderStrategy['type']
    strategyTune: RenderStrategy['tune']
  }

  processor: keyof typeof Processors;

  processingVideoSettings: VideoSettings

  UI: {
    fileSizePresets: {
      text: string,
      size: number
    }[]
  }

  flags: {
    enableDevTools: boolean,
    noHevcNvencBFrames: boolean
  }
}

class RendererSettingsClass {

  // default settings (they are overwritten from JSON at init)
  @observable readonly settings: RendererSettings = {
    theme: "dark",

    ID: uuid(),

    processingParams: {
      strategyType: 'max-file-size',
      strategyTune: ConfigMaxFileSizeDefaultSize,
    },

    processor: 'libx264',

    processingVideoSettings: {
      fps: "original",
      height: "original"
    },

    UI: {
      fileSizePresets: [
        { size: ConfigMaxFileSizeDefaultSize, text: ' 8 MB (Discord Free)' },
        { size: 10, text: '10 MB' },
        { size: 50, text: '50 MB (Discord Nitro Classic)' },
        { size: 64, text: '64 MB (WhatsApp)' },
        { size: 100, text: '100 MB (Discord Nitro)' },
      ]
    },

    flags: {
      enableDevTools: false,
      noHevcNvencBFrames: false
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
        JSON.parse(readFileSync(this.settings_file).toString()),
        {replaceArrays: true}
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
        if (!prevType) return;

        if (type === prevType) {
          return;
        }

        this.settings.processingParams.strategyTune = type === 'max-file-size' ?
          this.settings.UI.fileSizePresets[0].size :
          ConfigConstantQualityDefaultQuality
      },
      { fireImmediately: true }
    );

    console.log('tune is', this.settings.processingParams.strategyTune);
  }
}

export const RendererSettings = new RendererSettingsClass();

if ('window' in global) {
  // @ts-ignore
  window.RendererSettings = RendererSettings;
}
