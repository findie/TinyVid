/**
 Copyright Findie 2021
 */
import {action, makeObservable, observable} from "mobx";

class AppStateClass {


  @observable file: string = '';
  @action setFile = (f: string) => {
    console.log('setting input file to', f);
    this.file = f;
  }

  @observable trimRange: { start: number, end: number } = { start: 0, end: 0 };
  @action setTrimRangeComponent = (k: keyof AppStateClass['trimRange'], v: number) => this.trimRange[k] = v;
  @observable lastTrimValue: number = 0;
  @action setLastTrimValue = (v: number) => this.lastTrimValue = v;

  // @observable showSettings = false;
  // @action setShowSettings = (show: boolean) => this.showSettings = show;

  constructor() {
    makeObservable(this);
  }
}

export const AppState = new AppStateClass();

// @ts-ignore
window.AppState = AppState;
