export type RenderStrategy = {
  type: 'max-file-size' | 'constant-quality'

  // index for veryfast, fast, normal, slow, etc...
  speed: number

  // - quality (crf when 'constant-quality')
  // - size (in MB when 'max-file-size')
  tune: number
}

export type VideoSettings = {
  fps: 'original' | number,
  height: 'original' | number
}


export interface TrimPostData {
  start: number,
  end: number,
  out: string,
  strategy: RenderStrategy,
  settings: VideoSettings
}