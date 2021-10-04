/**
 Copyright Findie 2021
 */
import {ProcessHelpers} from "../process";
import {FFFiles} from "./files";
import PQueue from "p-queue";
import simpleSpawn = ProcessHelpers.simpleSpawn;

const lineRegex = /^.*?([VAS.])([F.])([S.])([X.])([B.])([D.])([^=]*?)\s+(\w+)\s*(.*)$/i;

export type FFEncoder = {
  flags: {
    type: 'audio' | 'video' | 'subtitle' | 'unknown'
    frame_mtt: boolean
    slice_mtt: boolean
    experimental: boolean
    draw_horiz: boolean
    direct_draw_1: boolean
    extra: string[]
  }
  name: string
  desc: string
}

export const ff_encoders = (async () => {
  const { stdout } = await simpleSpawn(FFFiles.ffmpeg, ['-encoders']);

  const lines = stdout.split('\n').map(x => x.trim()).filter(x => !!x);

  const encoders: FFEncoder[] = [];

  for (let i = 0; i < lines.length; i++) {

    const line = lines[i];

    const data = lineRegex.exec(line);

    if (data) {
      encoders.push({
        flags: {
          type: data[1].toUpperCase() === 'V' ?
            'video' :
            data[1].toUpperCase() === 'A' ?
              'audio' :
              data[1].toUpperCase() === 'S' ?
                'subtitle' :
                'unknown',
          frame_mtt: data[2].toUpperCase() === 'F',
          slice_mtt: data[3].toUpperCase() === 'S',
          experimental: data[4].toUpperCase() === 'X',
          draw_horiz: data[5].toUpperCase() === 'B',
          direct_draw_1: data[6].toUpperCase() === 'D',
          extra: data[7].split(''),
        },
        name: data[8].trim(),
        desc: data[9].trim()
      });
    }
  }

  return encoders;
})();

export const ff_encoders_map = ff_encoders.then(x => new Map(x.map(e => [e.name, e])));

const encoderChecksQ = new PQueue({ concurrency: 1, autoStart: true });

export async function checkIfEncoderWorks(encoder: string, customEncoderArgs = ['-c:v', encoder]) {

  return await encoderChecksQ.add(async () => {
    try {
      console.log('checking if encoder', encoder, 'works');
      await simpleSpawn(FFFiles.ffmpeg, [
        '-f', 'lavfi',
        '-i', 'color',
        '-t', '1',
        ...customEncoderArgs,
        '-f', 'null',
        '-'
      ]);
      console.log('encoder', encoder, 'works');
      return true;
    } catch (e) {
      console.error('encoder', encoder, 'doesn\'t work');
      console.error(e);
      return false;
    }
  })

}
