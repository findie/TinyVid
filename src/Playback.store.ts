/**
 Copyright Findie 2021
 */
import {action, computed, makeObservable, observable, reaction} from "mobx";
import {createRef} from "react";
import {AppState} from "./AppState.store";

class PlaybackStoreClass {

  @observable videoRef = createRef<HTMLVideoElement>();

  @observable currentVideoTimestamp: number = 0;

  @observable private updateTimer: NodeJS.Timeout | null = null;

  @action private updateTime = () => {
    const video = this.videoRef.current
    if (!video) return this.pause();

    this.currentVideoTimestamp = video.currentTime ?? 0;

    if (video.currentTime >= AppState.trimRange.end) {
      video.currentTime = AppState.trimRange.start;
    }
  }

  @computed get isPlaying() {
    return !!this.updateTimer;
  }

  constructor() {
    makeObservable(this);

    reaction(() => this.videoRef.current, (v, prev) => {
      if (prev) {
        prev.removeEventListener("timeupdate", this.updateTime);
        prev.removeEventListener('ended', this.play);
      }

      if (v) {
        v.addEventListener('timeupdate', this.updateTime);
        v.addEventListener('ended', this.play);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();
        this.togglePlayback();
      }
    })
  }

  @action play = () => {
    if (!this.videoRef.current) return;

    // this.videoRef.current.currentTime = AppState.trimRange.start;
    this.videoRef.current.play();
    if (!this.updateTimer)
      this.updateTimer = setInterval(this.updateTime, 1000 / 30);
  }

  @action pause = () => {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }

    this.videoRef.current?.pause();
  }

  togglePlayback = () => {
    if (this.isPlaying) {
      return this.pause();
    }
    return this.play();
  }

  @action
  setTime = (time: number) => {
    if (!this.videoRef.current) return;

    this.currentVideoTimestamp = time;
    this.videoRef.current.currentTime = time;
  }
}

export const PlaybackStore = new PlaybackStoreClass();

// @ts-ignore
window.PlaybackStore = PlaybackStore;
