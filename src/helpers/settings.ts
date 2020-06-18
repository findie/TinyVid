import {existsSync, readFileSync, writeFileSync} from "fs";
import {ResourceHelpers} from "../../electron/helpers/resources";
import {Theme} from "./theme";

export namespace RendererSettings {

  export interface RendererSettings {
    theme: Theme.ThemeNames
  }

  export const settings: RendererSettings = {
    theme: "dark"
  }

  export const settings_file = ResourceHelpers.real_app_dir('renderer_settings.json');

  export function load() {
    if (!existsSync(settings_file)) {
      return;
    }
    Object.assign(settings, JSON.parse(readFileSync(settings_file).toString()));
  }

  export function save() {
    return writeFileSync(settings_file, JSON.stringify(settings));
  }

  // load settings in
  load();
}