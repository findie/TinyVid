/**
 Copyright Findie 2021
 */
import {action, makeObservable, observable} from "mobx";
import {registerRendererHandler} from "../../common/shared-event-comms";
import {dialog, getCurrentWindow} from "@electron/remote";
import {eventList} from "../helpers/events";
import {ipcRenderer} from 'electron';
import {QueueStore} from "./QueueStore";
import {RendererFileHelpers} from "../helpers/file";

class AppStateClass {

  @observable file: string | null = null;
  @action setFile = (f: AppStateClass["file"]) => {
    console.log('setting input file to', f);
    this.file = f;
  }

  @observable trimRange: { start: number, end: number } = { start: 0, end: 0 };
  @action setTrimRangeComponent = (k: keyof AppStateClass['trimRange'], v: number) => this.trimRange[k] = v;
  @observable lastTrimValue: number = 0;
  @action setLastTrimValue = (v: number) => this.lastTrimValue = v;

  @observable showQueue = false;
  @action setShowQueue = (show: boolean) => {
    if (show) {
      this.setFile(null);
    }
    this.showQueue = show;
  }

  constructor() {
    makeObservable(this);

    registerRendererHandler(ipcRenderer, 'open-file', this.requestFileInputDialogFlow);
  }

  requestFileInputDialogFlow = async () => {

    const files = await dialog.showOpenDialog(
      getCurrentWindow(),
      {
        properties: ['openFile', 'multiSelections'],
        buttonLabel: 'Open',
        title: 'Open file or files to add',
        filters: RendererFileHelpers.videoFilters
      });

    if (!files.canceled && files.filePaths.length) {
      eventList.file.choose({ type: 'click' });
      this.handleFileInput(files.filePaths);
    }
  }

  @action
  handleFileInput = (fl: string[]) => {
    if (fl.length === 0) {
      return;
    }

    if (fl.length === 1 && !AppState.showQueue) {
      this.setFile(fl[0]);
      return;
    }

    this.setShowQueue(true);
    fl.forEach(QueueStore.addFilePath);
  }
}

export const AppState = new AppStateClass();

// @ts-ignore
window.AppState = AppState;
