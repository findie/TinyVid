import * as path from 'path'
import {FFMpegProgress, IFFMpegProgressData} from "ffmpeg-progress-wrapper";
import {app} from 'electron';
import {FFHelpers} from "./ffhelpers";

const processes = new Map<string, FFMpegProgress>();
const progress = new Map<string, IFFMpegProgressData>();

export async function trim(file: string,
                           start: number,
                           end: number,
                           out: string | undefined,
                           strategy: FFHelpers.RenderStrategy,
                           settings: FFHelpers.VideoSettings) {

  if (!out) {
    out = `${file}.${start.toFixed()}-${end.toFixed()}.mp4`;
  }

  let bin = '';
  if (process.platform === 'win32') {
    bin = path.join(app.getAppPath(), 'bin', 'windows-64', 'ffmpeg');
  } else if (process.platform === 'linux') {
    bin = path.join(app.getAppPath(), 'bin', 'linux-64', 'ffmpeg');
  } else {
    throw new Error('unsupported platform ' + process.platform);
  }

  progress.set(file, { progress: 0, eta: 0 })

  const filters = [];
  if (settings.fps !== "original") {
    filters.push(`fps=${settings.fps}`);
  }
  if (settings.height !== "original") {
    filters.push(`scale=-2:${settings.height}`);
  }

  const extraParams: string[] = []
  if (strategy.type === "constant-quality") {

    extraParams.push(...[
      '-crf', strategy.quality.toString(),
      '-preset', FFHelpers.encodingSpeedPresets[strategy.speed_or_file_size]
    ])

  } else if (strategy.type === "max-file-size") {

    const duration = end - start;
    const fileSizeInKB = strategy.size * 1000;

    const bitrateInKb = fileSizeInKB / duration * 8;

    const audioBitrateInKb = Math.min(bitrateInKb * 0.1, 96); // 10% or at most 64k
    const videoBitrateInKb = bitrateInKb - audioBitrateInKb;

    extraParams.push(...[
      '-qmin:v', '21',
      // '-b:v', Math.floor(videoBitrateInKb) + 'k',
      '-maxrate:v', Math.floor(videoBitrateInKb) + 'k',
      '-minrate:v', Math.floor(videoBitrateInKb * 0.9) + 'k',
      '-b:a', Math.floor(audioBitrateInKb) + 'k',
      '-bufsize', Math.floor(bitrateInKb / 2) + 'k',
      '-preset:v', FFHelpers.encodingSpeedPresets[strategy.speed_or_quality]
    ])
  }

  const p = new FFMpegProgress([
      '-ss', start.toFixed(6),
      '-to', end.toFixed(6),
      '-i', file,
      ...(filters.length ? ['-vf', filters.join(',')] : []),
      ...extraParams,
      '-c:v', 'libx264',
      out, '-y'
    ],
    {
      duration: (end - start) * 1000,
      cmd: bin
    }
  );

  p.on('progress', (p: IFFMpegProgressData) => {
    console.log(file, p.progress, p.eta);
    progress.set(file, p);
  });

  p.on('raw', console.error);

  p.once('end', () => progress.delete(file));

  processes.set(file, p);

  try {
    await p.onDone();
  } catch (e) {
    console.error(e);
  }
}

export function check(file: string): IFFMpegProgressData | null {

  const p = progress.get(file);
  if (!p) return null;

  return p;
}