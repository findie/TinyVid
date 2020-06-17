import {createMuiTheme, ThemeOptions} from "@material-ui/core";
import {remote} from 'electron';
import {RendererSettings} from "./settings";

export namespace Theme {

  export type ThemeNames = 'dark' | 'light' | 'system';

  const nativeTheme = remote.nativeTheme;

  const shouldUseDarkTheme = () => nativeTheme.shouldUseDarkColors;

  const darkTheme = createMuiTheme({
    palette: {
      type: 'dark',
    },
  });

  const lightTheme = createMuiTheme({
    palette: {
      background: {
        paper: '#f3f3f3'
      }
    },
  });

  export const current = () => shouldUseDarkTheme() ? darkTheme : lightTheme;
  export const currentName = () => nativeTheme.themeSource;

  export const set = (s: ThemeNames) => {
    nativeTheme.themeSource = s;
    RendererSettings.settings.theme = s;
    RendererSettings.save();
  }

  export const setNext = (): ThemeNames => {
    let t: ThemeNames = 'system';
    if (nativeTheme.themeSource === 'system') {
      t = 'dark';
    }
    if (nativeTheme.themeSource === 'dark') {
      t = 'light';
    }
    if (nativeTheme.themeSource === 'light') {
      t = 'system';
    }
    set(t);
    return t;
  }

  // load from settings
  set(RendererSettings.settings.theme);
}

window.Theme = Theme;

declare global {
  interface Window {
    Theme: typeof Theme
  }
}