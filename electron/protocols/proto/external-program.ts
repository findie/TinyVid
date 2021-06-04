import {JSONAndStreamProtocol} from "../base-protocols";
import {v4 as uuid} from 'uuid'
import {logError} from "../../../common/sentry";
import {ChildProcess, spawn, StdioOptions} from "child_process";

export namespace ExternalProgramProtocol {


  export class ExternalProcessError extends Error {
    name = 'ExternalProcessError'
    code: number
    signal: string

    constructor(message: string, code: number, signal: string) {
      super(message);
      this.code = code;
      this.signal = signal;
    }
  }

  export type ExternalProgramProtocolRunPayload = {
    args: string[],
    cwd?: string
    env?: NodeJS.ProcessEnv,
    stdio?: StdioOptions;
  }

  export type ExternalProgramProtocolStopPayload = {
    id: string,
    signal?: NodeJS.Signals
  }

  type Task = {
    id: string
    process: ChildProcess
    done: boolean
    error: ExternalProcessError | null
    cancelled: boolean
    promise: Promise<number> | null,
    data: ExternalProgramProtocolRunPayload
  }

  export class ExternalProgramProtocol<ExternalExec extends string> extends JSONAndStreamProtocol {

    readonly tasks = new Map<string, Task>();
    readonly exec: string;

    constructor(name: ExternalExec, exec: string = name) {
      super(name);
      this.exec = exec;
    }

    async onRequest(req: Electron.Request, payload: any): Promise<any> {
      const pathname = decodeURIComponent(req.url.replace(`${this.protocolName}://`, ''));

      switch (pathname.toLowerCase()) {
        case 'run':
          return this.run(payload as ExternalProgramProtocolRunPayload);
        case 'stop':
          return this.stop(payload as ExternalProgramProtocolStopPayload);
      }
      return {};
    }

    async onRequestStream(req: Electron.Request, payload: { stdioPort: number }): Promise<any> {
      const taskID = decodeURIComponent(req.url.replace(`${this.streamProtocolName}://`, ''));

      return this.stream(taskID, payload.stdioPort);
    }

    run(data: ExternalProgramProtocolRunPayload) {
      const id = uuid();
      const task: Task = {
        id,
        process: spawn(this.exec, data.args, {
          env: data.env,
          cwd: data.cwd,
          stdio: data.stdio
        }),
        promise: Promise.resolve(0),
        error: null,
        done: false,
        cancelled: false,
        data,
      }

      task.promise = new Promise((res, rej) => {
        task.process.once('close', (code, sig) => {
          if (code || sig) {

            return rej(
              new ExternalProcessError(`${this.exec} ${data.args.join(' ')} exited with code ${code} signal ${sig}`, code || 0, sig || '')
            );
          }

          task.done = true;
          return res(code || 0);
        })
      });

      task.promise.catch(e => {
        task.error = { ...e };
        task.error!.stack = e.stack;
        task.error!.message = e.message;
        logError(e);
      });

      this.tasks.set(id, task);

      return { id };
    }

    stop(data: ExternalProgramProtocolStopPayload) {
      const { id, signal = 'SIGINT' } = data;
      const task = this.tasks.get(id);

      if (!task) return null;

      if (!task.process) return null;

      if (task.cancelled) return null;

      task.cancelled = true;
      task.process.kill(signal);

      return {};
    }

    stream(taskID: string, which: 'stdout' | 'stderr' | number) {
      if (which === "stdout") which = 1;
      if (which === "stderr") which = 2;

      const task = this.tasks.get(taskID);
      if (!task) throw new Error(`Cannot find task ${taskID}`);

      return task.process.stdio[which];
    }

    terminateAll() {
      this.tasks.forEach(x => {
        if (x.process && !x.done) {
          console.log('Terminating task', x.id, 'args:', x.data.args.join(' '));
          x.process.kill('SIGINT')
        }
      });
    }

    getRunningTasks() {
      return [...this.tasks.values()].filter(x => !(x.done || x.cancelled));
    }
  }

}

/* example usage for a protocol of ffmpeg


r = await fetch('ffmpeg://run', {
    method: 'post',
    body: JSON.stringify({
        args: [
        '-progress', 'pipe:3',
        '-f', 'lavfi',
        '-i', 'color',
        '-f', 'null',
        '-'
        ],
         stdio: [null, null, null, "pipe"]

    })
});

procData = await r.json();
id = procData.success.id;

await new Promise(_ => setTimeout(_, 1000));

async function stream(pipe){
  const rs = await fetch('ffmpeg-stream://'+id, {

      method: 'post',
      body: JSON.stringify({
         stdioPort: pipe
      })

  });
  const reader = rs.body
    .pipeThrough(new TextDecoderStream())
    .getReader();

  let done = false;

  while(!done){
    const data = await reader.read();
    done = data.done;
    console.log(pipe,':',data.value);

    if(done) console.log('pipe', pipe, 'finished');
  }
}

stream(2);
stream(3);

await new Promise(_ => setTimeout(_, 10000));

await fetch('ffmpeg://stop', {
    method: 'post',
    body: JSON.stringify({
      id,
      signal: 'SIGINT'
    })
});

 */
