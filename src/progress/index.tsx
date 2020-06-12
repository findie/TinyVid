import React, {useState} from 'react';
import css from './style.css'
import {FFMpegError, IFFMpegProgressData} from "ffmpeg-progress-wrapper";
import {remote} from 'electron';
import {TrimComms} from "../helpers/comms";
import {Modal} from "../components/modal";
import {LinearProgress, Paper} from '@material-ui/core';
import * as path from 'path';
import moment from "moment";

interface ProgressProps {
  out: string
  progress: IFFMpegProgressData | null
}

const Progress = (props: ProgressProps) => {

  return (
    <div className={css.progressContainer}>
      <LinearProgress
        variant="determinate"
        value={(props?.progress?.progress || 0) * 100}
        style={{ height: '80px' }}
      />

      <div className={css.info}>
        <div>Speed: {(props?.progress?.speed || 0).toFixed(2)}x</div>
        <div>Finishing in {moment(Date.now() + (props?.progress?.eta || 0) * 1000).fromNow(true)}</div>
      </div>
    </div>
  )

}

interface ProgressErrorProps {
  error: FFMpegError
}

const ProgressError = (props: ProgressErrorProps) => {

  return (
    <div>
      <div>{props.error.message}</div>
    </div>
  )

}

interface DoneProps {
  file: string
  onOk: () => void
}

const Done = (props: DoneProps) => {
  return (
    <div>
      <div>Done!</div>
      <div>Saved in {props.file}</div>
      <div>
        <button onClick={props.onOk}>Ok</button>
        <button onClick={() => remote.shell.openPath(props.file)}>Open</button>
      </div>
    </div>
  )
}

export interface ProcessingOverlayProps {
  id: string
  fileIn: string
  fileOut: string
  onDone: () => void
}

export const ProcessingOverlay = (props: ProcessingOverlayProps) => {

  const [isDone, setIsDone] = useState(false);
  const [progress, setProgress] = useState<IFFMpegProgressData | null>(null);
  const [error, setError] = useState<FFMpegError | null>(null);

  if (!isDone) {
    setTimeout(async () => {

      const task = await TrimComms.checkProcess(props.id);

      if (task?.error) {
        setError(task.error);
      }

      if (task?.progress) {
        setProgress(task.progress);
      }


      if (!task || task.done) {
        setIsDone(true);
      }

    }, 1000);
  }

  let component: JSX.Element;
  if (isDone && !error) {
    component = <Done file={props.fileOut} onOk={props.onDone}/>
  } else if (error) {
    component = <ProgressError error={error}/>
  } else {
    component = <Progress progress={progress} out={props.fileOut}/>
  }

  return (
    <Modal className={css.container}>
      <Paper elevation={3} className={css.title}>
        <strong>Processing:</strong> {path.dirname(props.fileIn) + path.sep}<strong>{path.basename(props.fileIn)}</strong>
      </Paper>
      <div className={css.innerContainer}>
        {component}
      </div>
    </Modal>
  )
}