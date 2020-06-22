import {spawn, SpawnOptions} from 'child_process'
import * as path from "path";

export namespace ProcessHelpers {

  type Signals = NodeJS.Signals ;

  export class ProcessError extends Error {
    code: number;
    signal: Signals | null;

    constructor(message: string, code?: number, sig?: Signals) {
      super(message);
      this.code = code || 0;
      this.signal = sig || null;
    }
  }

  export async function simpleSpawn(exec: string, args: string[], options: SpawnOptions = {}) {

    const p = spawn(exec, args, options);

    let stdout = '';
    let stderr = '';

    if (p.stdout) {
      p.stdout.on('data', d => {
        stdout += d.toString();
      });
    }
    if (p.stderr) {
      p.stderr.on('data', d => {
        stderr += d.toString()
      });
    }

    await new Promise((res, rej) => {

      p.once('close', (code, sig) => {

        if (code || sig) {
          return rej(new ProcessError(`${path.basename(exec)}: ${stderr || 'unknown failure'}`, code, sig));
        }

        return res();
      });

    });

    return {
      stdout,
      stderr
    }
  }

}