import * as path from 'path'
import {FFMpegProgress, IFFMpegProgressData} from "ffmpeg-progress-wrapper";
import {app} from 'electron';

const processes = new Map<string, FFMpegProgress>();
const progress = new Map<string, IFFMpegProgressData>();

export async function trim(file: string, start: number, end: number, out: string = `${file}.${start.toFixed()}-${end.toFixed()}.mp4`) {

  let bin = '';
  if (process.platform === 'win32') {
    bin = path.join(app.getAppPath(), 'bin', 'windows-64', 'ffmpeg');
  } else if (process.platform === 'linux') {
    bin = path.join(app.getAppPath(), 'bin', 'linux-64', 'ffmpeg');
  } else {
    throw new Error('unsupported platform ' + process.platform);
  }

  progress.set(file, { progress: 0, eta: 0 })

  const p = new FFMpegProgress([
      '-ss', start.toFixed(6),
      '-to', end.toFixed(6),
      '-i', file,
      '-crf', '21',
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

  p.once('end', () => progress.delete(file));

  processes.set(file, p);
}

export function check(file: string): IFFMpegProgressData | null {

  const p = progress.get(file);
  if (!p) return null;

  return p;
}