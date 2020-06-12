import {FFMpegProgress, IFFMpegProgressData} from "ffmpeg-progress-wrapper";
import {FFHelpers} from "./index";
import {RenderStrategy, VideoSettings} from "../../types";

export namespace VideoProcess {

  function strategy2params(strategy: RenderStrategy, duration: number) {

    switch (strategy.type) {
      case "constant-quality":
        return [
          '-crf', strategy.tune.toString(),
          '-preset', FFHelpers.encodingSpeedPresets[strategy.speed]
        ];

      case "max-file-size":
        const fileSizeInKB = strategy.tune * 1000;

        const bitrateInKb = fileSizeInKB / duration * 8;

        const audioBitrateInKb = Math.min(bitrateInKb * 0.1, 96); // 10% or at most 64k
        const videoBitrateInKb = bitrateInKb - audioBitrateInKb;

        return [
          '-qmin:v', '21',
          // '-b:v', Math.floor(videoBitrateInKb) + 'k',
          '-maxrate:v', Math.floor(videoBitrateInKb) + 'k',
          '-minrate:v', Math.floor(videoBitrateInKb * 0.9) + 'k',
          '-b:a', Math.floor(audioBitrateInKb) + 'k',
          '-bufsize', Math.floor(bitrateInKb / 2) + 'k',
          '-preset:v', FFHelpers.encodingSpeedPresets[strategy.speed]
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

  export function process(file: string,
                          start: number,
                          end: number,
                          out: string,
                          strategy: RenderStrategy,
                          settings: VideoSettings,
                          progress: (p: IFFMpegProgressData) => void
  ) {

    const ffmpeg = FFHelpers.ffmpeg;

    if (!out) {
      out = `${file}.${start.toFixed()}-${end.toFixed()}.mp4`;
    }

    const p = new FFMpegProgress([
        '-ss', start.toFixed(6),
        '-to', end.toFixed(6),
        '-i', file,
        '-vf', settings2filters(settings).join(';'),
        ...strategy2params(strategy, end - start),
        '-c:v', 'libx264',
        out, '-y'
      ],
      {
        duration: (end - start),
        cmd: ffmpeg,
        hideFFConfig: true
      }
    );

    p.on('progress', (p: IFFMpegProgressData) => {
      console.log(file, p.progress, p.eta);
      progress(p);
    });

    p.on('raw', console.error);

    return p;
  }

}
