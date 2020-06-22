import {createMuiTheme, ThemeOptions} from "@material-ui/core";
import {remote} from 'electron';
import {RendererSettings} from "./settings";
import color from "color";
import {objectMergeDeep} from "./js";

export namespace Theme {

  export type ThemeNames = 'dark' | 'light' | 'system';

  const nativeTheme = remote.nativeTheme;

  export const shouldUseDarkTheme = () => nativeTheme.shouldUseDarkColors;

  const commonTheme: ThemeOptions = {
    palette: {
      primary: {
        main: '#0082FF'
      },
      secondary: {
        main: '#6E27CC'
      }
    },
    overrides: {
      MuiTooltip: {
        tooltip: {
          fontSize: '0.8rem'
        }
      },
      MuiLink: {
        root: {
          cursor: 'pointer'
        }
      }
    }
  };

  const darkTheme = createMuiTheme(objectMergeDeep({
    palette: {
      type: 'dark',
    },
    overrides: {
      MuiLink: {
        root: {
          color: 'white'
        }
      }
    }
  }, commonTheme));

  const lightTheme = createMuiTheme(objectMergeDeep({
    palette: {
      background: {
        paper: '#e8e8e8'
      }
    },
    overrides: {
      MuiLink: {
        root: {
          color: 'black'
        }
      }
    }
  }, commonTheme));

  export const current = () => shouldUseDarkTheme() ? darkTheme : lightTheme;
  export const currentName = () => nativeTheme.themeSource;

  export const disabledColor = (c: string) => shouldUseDarkTheme() ?
    color(c).desaturate(0.7).toString() :
    color(c).desaturate(0.7).lighten(0.5).toString()

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