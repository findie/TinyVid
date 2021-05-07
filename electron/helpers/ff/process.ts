import {FFMpegProgress, IFFMpegProgressData} from "ffmpeg-progress-wrapper";
import {FFHelpers} from "./index";
import {AudioSettings, RenderStrategy, VideoSettings} from "../../types";
import {MediaDetails} from "../../../common/ff/types";
import {ff_getAudioTrackIndexes} from "../../../common/ff";

export namespace VideoProcess {

  function strategy2params(strategy: RenderStrategy, duration: number, hasAudio: boolean) {

    switch (strategy.type) {
      case "constant-quality":
        return [
          '-crf', strategy.tune.toString(),
          '-preset', FFHelpers.encodingSpeedPresets[strategy.speed]
        ];

      case "max-file-size":
        const { audioBitrateInKb, videoBitrateInKb } = FFHelpers.computeAverageBPS(strategy.tune, duration, hasAudio);

        return [
          '-qmin:v', '-1',
          '-qmax:v', '-1',
          '-b:v', Math.floor(videoBitrateInKb) + 'k',
          '-maxrate:v', Math.floor(videoBitrateInKb) + 'k',
          '-minrate:v', Math.floor(videoBitrateInKb * 0.9) + 'k',
          '-b:a', Math.floor(audioBitrateInKb) + 'k',
          '-bufsize:v', Math.floor(videoBitrateInKb) + 'k',
          '-preset:v', FFHelpers.encodingSpeedPresets[strategy.speed],
          '-x264-params', "nal-hrd=cbr"
        ];

      default:
        throw new Error('unknown strategy ' + strategy.type);
    }
  }

  function settings2filters(settings: VideoSettings) {
    const filters = [];

    if (settings.fps !== "original") {
      filters.push(`fps=${settings.fps}`);
    }
    if (settings.height !== "original") {
      filters.push(`scale=-2:${settings.height}`);
    }

    if (filters.length === 0) {
      filters.push('null')
    }
    return filters;
  }

  function audio2filters(audio: AudioSettings) {
    const filters = [];
    if (audio.volume !== 1) {
      filters.push(`volume=${audio.volume ?? 1}`)
    }

    if (filters.length === 0) {
      filters.push('anull')
    }
    return filters;
  }

  function filterComplex(mediaDetails: MediaDetails, videoSettings: VideoSettings, audioSettings: AudioSettings) {
    const steps: string[] = [];
    const mappings = new Set<string>();

    steps.push(`[0:v]${settings2filters(videoSettings).join(',')}[v]`);
    mappings.add('[v]')

    const audioStreamIndexes = ff_getAudioTrackIndexes(mediaDetails);

    if (audioStreamIndexes.length > 0 && audioSettings.volume > 0) {
      const audioFilters = audio2filters(audioSettings);

      const header = audioStreamIndexes.map((i) => `[0:${i}]`).join('');

      if(audioStreamIndexes.length > 1){
        audioFilters.unshift(`amix=${audioStreamIndexes.length}`);
      }

      steps.push(`${header}${audioFilters.join(',')}[a]`)
      mappings.add('[a]');
    }

    return {
      filter_complex: steps,
      mappings: [...mappings]
    };
  }

  export function process(file: string,
    start: number,
    end: number,
    out: string,
    strategy: RenderStrategy,
    settings: VideoSettings,
    audio: AudioSettings,
    mediaDetails: MediaDetails,
    progress: (p: IFFMpegProgressData) => void
  ) {

    const ffmpeg = FFHelpers.ffmpeg;

    if (!out) {
      out = `${file}.${start.toFixed()}-${end.toFixed()}.mp4`;
    }

    const fc = filterComplex(mediaDetails, settings, audio);

    console.log('filter_complex', fc.filter_complex);
    console.log('filter_complex mappings', fc.mappings);

    const p = new FFMpegProgress([
        '-ss', start.toFixed(6),
        '-to', end.toFixed(6),
        '-i', file,

        ...(fc.filter_complex.length > 0 ? ['-filter_complex', fc.filter_complex.join(';')] : []),
        ...(fc.mappings.length > 0 ? fc.mappings.map(x => ['-map', x]).flat() : []),

        ...strategy2params(strategy, end - start, audio?.volume > 0),
        ...(audio?.volume > 0 ? [] : ['-an']),
        '-c:v', 'libx264',
        out, '-y'
      ],
      {
        duration: (end - start),
        cmd: ffmpeg,
        hideFFConfig: true
      }
    );

    console.log('ffmpeg', p.args);

    p.on('progress', (p: IFFMpegProgressData) => {
      console.log(file, p.progress, p.eta);
      progress(p);
    });

    p.on('raw', console.log);

    return p;
  }

}
