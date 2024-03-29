import {createMuiTheme, ThemeOptions} from "@material-ui/core";
import * as remote from '@electron/remote';
import {RendererSettings} from "./settings";
import color from "color";
import {objectMergeDeep} from "./js";
import {action, computed, makeObservable, observable} from "mobx";
import {eventList} from "./events";

export type ThemeNames = 'dark' | 'light' | 'system';

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
        fontSize: '1rem',
        maxWidth: 400,
        backgroundColor: 'rgba(0,130,255,0.8)'
      },
      arrow: {
        color: 'rgba(0,130,255,0.6)'
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

class ThemeClass {

  private readonly nativeTheme = remote.nativeTheme;

  readonly lightTheme = lightTheme;
  readonly darkTheme = darkTheme;

  @observable private themeSource = remote.nativeTheme.themeSource;
  @observable private shouldUseDarkColors = remote.nativeTheme.shouldUseDarkColors;

  constructor() {
    makeObservable(this);
    // load from settings
    this.set(RendererSettings.settings.theme);

    this.nativeTheme.on('updated', action(() => {
      this.themeSource = this.nativeTheme.themeSource;
      this.shouldUseDarkColors = this.nativeTheme.shouldUseDarkColors;
    }));
  }

  @computed get shouldUseDarkTheme() {
    return this.shouldUseDarkColors;
  };

  @computed get current() {
    return this.shouldUseDarkTheme ? darkTheme : lightTheme
  };

  @computed get currentName() {
    return this.themeSource;
  }

  disabledColor = (c: string) => this.shouldUseDarkTheme ?
    color(c).desaturate(0.7).toString() :
    color(c).desaturate(0.7).lighten(0.5).toString()

  @action
  set = (s: ThemeNames) => {
    this.nativeTheme.themeSource = s;
    this.themeSource = this.nativeTheme.themeSource;
    this.shouldUseDarkColors = this.nativeTheme.shouldUseDarkColors;
    RendererSettings.settings.theme = s;
  }

  setNext = (): ThemeNames => {
    let t: ThemeNames = 'system';
    if (this.nativeTheme.themeSource === 'system') {
      t = 'dark';
    }
    if (this.nativeTheme.themeSource === 'dark') {
      t = 'light';
    }
    if (this.nativeTheme.themeSource === 'light') {
      t = 'system';
    }
    this.set(t);
    eventList.global.switchTheme({ type: t });
    return t;
  }

}

export const Theme = new ThemeClass()

window.Theme = Theme;

declare global {
  interface Window {
    Theme: typeof Theme
  }
}
