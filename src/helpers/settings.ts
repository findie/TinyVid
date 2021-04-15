import {existsSync, readFileSync, writeFileSync} from "fs";
import {ResourceHelpers} from "../../electron/helpers/resources";
import {Theme, ThemeNames} from "./theme";

export namespace RendererSettings {

  export interface RendererSettings {
    theme: ThemeNames
  }

  export const settings: RendererSettings = {
    theme: "dark"
  }

  export const settings_file = ResourceHelpers.userData_dir('renderer_settings.json');

  export function load() {
    if (!existsSync(settings_file)) {
      return;
    }
    console.log('loading settings from', settings_file);
    try {
      Object.assign(settings, JSON.parse(readFileSync(settings_file).toString()));
    } catch (e) {
      console.error('failed to load settings file', e);
    }
  }

  export function save() {
    console.log('saving settings from', settings_file);
    try {
      writeFileSync(settings_file, JSON.stringify(settings));
    } catch (e) {
      console.error('failed to save settings file', e);
    }
  }

  // load settings in
  load();
}
