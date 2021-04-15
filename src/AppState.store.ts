/**
 Copyright Findie 2021
 */
import {action, makeObservable, observable} from "mobx";

class AppStateClass {


  @observable file: string = '';
  @action setFile = (f: string) => this.file = f;

  @observable trimRange: { start: number, end: number } = { start: 0, end: 0 };
  @action setTrimRange = (tr: AppStateClass['trimRange']) => this.trimRange = tr;
  @action setTrimRangeComponent = (k: keyof AppStateClass['trimRange'], v: number) => this.trimRange[k] = v;

  constructor() {
    makeObservable(this);
  }
}

export const AppState = new AppStateClass();
