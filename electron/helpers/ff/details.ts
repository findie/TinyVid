import {ProcessHelpers} from "../process";
import {FFHelpers} from "./index";
import {existsSync} from "fs";
import * as assert from 'assert';
import {MediaDetails, StringFraction} from "../../../common/ff/types";

export namespace VideoDetails {

  export async function details(file: string): Promise<MediaDetails> {

    if (!existsSync(file)) {
      throw new Error(`File ${file} doesn't exist`);
    }

    const data = await ProcessHelpers.simpleSpawn(FFHelpers.ffprobe, [
      '-i', file,
      '-hide_banner',
      '-show_format',
      '-show_streams',
      '-count_packets',
      '-of', 'json'
    ]);

    return JSON.parse(data.stdout);
  }

  export function parseStringFraction(f: StringFraction): number {
    const atoms = f.split('/');
    assert.strictEqual(atoms.length, 2, 'cannot parse fraction with atoms len !== 2');

    return parseFloat(atoms[0]) / parseFloat(atoms[1]);
  }

}
