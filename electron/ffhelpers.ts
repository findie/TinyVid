export namespace FFHelpers {
  export type RenderStrategy = {
    type: 'max-file-size'
    size: number
    speed_or_quality: number
  } | {
    type: 'constant-quality'
    quality: number,
    speed_or_file_size: number
  }

  export type VideoSettings = {
    fps: 'original' | number,
    height: 'original' | number
  }

  export const encodingSpeedPresets: EncodingSpeedPresetsType[] = [
    'ultrafast',
    'superfast',
    'veryfast',
    'faster',
    'fast',
    'medium',
    'slow',
    'slower',
    'veryslow',
  ]

  export const encodingSpeedPresetsDisplay: string[] = [
    'ultra fast',
    'super fast',
    'very fast',
    'faster',
    'fast',
    'medium',
    'slow',
    'slower',
    'very slow'
  ]

  export type EncodingSpeedPresetsType =
    'ultrafast'
    | 'superfast'
    | 'veryfast'
    | 'faster'
    | 'fast'
    | 'medium'
    | 'slow'
    | 'slower'
    | 'veryslow'


}