/**
 Copyright Findie 2021
 */
import {action, computed, makeObservable, observable, reaction} from "mobx";
import {createRef} from "react";
import {AppState} from "./AppState.store";
import {eventList} from "./helpers/events";

class PlaybackStoreClass {

  @observable videoRef = createRef<HTMLVideoElement>();
  audio: {
    context: AudioContext,
    gain: GainNode,
    source: null | MediaElementAudioSourceNode
  };

  @observable currentVideoTimestamp: number = 0;

  @observable private updateTimer: number | null = null;

  @action private updateTime = () => {
    const video = this.videoRef.current
    if (!video) return this.pause();

    this.currentVideoTimestamp = video.currentTime ?? 0;

    if (this.isPlaying) {
      if (video.currentTime >= AppState.trimRange.end) {
        video.currentTime = AppState.trimRange.start;
      }
    }
  }

  @computed get isPlaying() {
    return !!this.updateTimer;
  }

  constructor() {
    makeObservable(this);

    const audioContext = new AudioContext();
    this.audio = {
      context: audioContext,
      gain: audioContext.createGain(),
      source: null
    };
    this.audio.gain.connect(audioContext.destination);

    reaction(() => this.videoRef.current, (v, prev) => {
      if (prev) {
        prev.removeEventListener("timeupdate", this.updateTime);
        prev.removeEventListener('ended', this.handleEndedVideo);

        console.log('disconnected source')
        this.audio.source?.disconnect();
        this.audio.source = null;
      }

      if (v) {
        v.addEventListener('timeupdate', this.updateTime);
        v.addEventListener('ended', this.handleEndedVideo);

        this.audio.source = this.audio.context.createMediaElementSource(v);
        console.log('created source');
        this.audio.source.connect(this.audio.gain);
        console.log('connected source to gain')
      }
    });

    document.addEventListener('keydown', (e) => {
      if (
        e.currentTarget instanceof HTMLTextAreaElement ||
        e.currentTarget instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLInputElement
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();
        this.togglePlayback();
      }
    })
  }

  setVolume = (v: number) => this.audio.gain.gain.value = v;

  handleEndedVideo = () => {
    if (this.isPlaying) this.play();
  }

  @action play = () => {
    if (!this.videoRef.current) return;

    eventList.preview.play();

    // this.videoRef.current.currentTime = AppState.trimRange.start;
    this.videoRef.current.play();
    if (!this.updateTimer)
      this.updateTimer = setInterval(this.updateTime, 1000 / 30) as unknown as number;
  }

  @action pause = () => {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }

    eventList.preview.pause();
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
