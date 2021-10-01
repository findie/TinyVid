import {MediaDetails} from "../common/ff/types";

export type RenderStrategy = {
  type: 'max-file-size' | 'constant-quality'

  // - quality (crf when 'constant-quality')
  // - size (in MB when 'max-file-size')
  tune: number
}

export type VideoSettings = {
  fps: 'original' | number,
  height: 'original' | number
}

export type AudioSettings = {
  volume: number
}

/** @deprecated */
export interface TrimPostData {
  start: number,
  end: number,
  out: string,
  strategy: RenderStrategy,
  settings: VideoSettings,
  audio: AudioSettings,
  mediaDetails: MediaDetails,
}
