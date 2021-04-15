/**
 Copyright Findie 2021
 */
import {action, makeObservable, observable} from "mobx";

class AppStateClass {


  @observable file: string = '';
  @action setFile = (f: string) => this.file = f;

  @observable trimRange: { start: number, end: number } = { start: 0, end: 0 };
  @action setTrimRangeComponent = (k: keyof AppStateClass['trimRange'], v: number) => this.trimRange[k] = v;
  @observable lastTrimValue: number = 0;
  @action setLastTrimValue = (v: number) => this.lastTrimValue = v;

  constructor() {
    makeObservable(this);
  }
}

export const AppState = new AppStateClass();
