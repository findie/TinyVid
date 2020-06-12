import React, {useEffect, useState} from 'react';
import css from './style.css'
import {FFMpegError, IFFMpegProgressData} from "ffmpeg-progress-wrapper";
import {remote} from 'electron';
import {TrimComms} from "../helpers/comms";
import {Modal} from "../components/modal";
import {Button, CircularProgress, LinearProgress, Paper} from '@material-ui/core';
import * as path from 'path';
import moment from "moment";

interface ProgressProps {
  out: string
  progress: IFFMpegProgressData | null
  onCancel: () => void
}

const Progress = (props: ProgressProps) => {

  const [cancelled, setCancelled] = useState(false);

  return (
    <div className={css.progressContainer}>
      <LinearProgress
        variant="determinate"
        value={(props?.progress?.progress || 0) * 100}
        className={css.progress}
      />

      <div className={css.info}>
        <div>Speed: {(props?.progress?.speed || 0).toFixed(2)}x</div>
        {
          cancelled ?
            <div>Cancelling the process</div> :
            props?.progress?.eta ?
              <div>Finishing in {moment(Date.now() + (props?.progress?.eta || 0) * 1000).fromNow(true)}</div> :
              <div>Starting the process</div>
        }
        <Button
          variant="contained"
          color="secondary"
          className={css.cancelBtn}
          disabled={cancelled}
          onClick={() => {
            setCancelled(true)
            props.onCancel()
          }}
        >
          {cancelled ? <CircularProgress color={"secondary"} size={26}/> : <>Cancel</>}
        </Button>
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
  wasCancelled: boolean
  onOk: () => void
}

const Done = (props: DoneProps) => {
  return (
    <div>
      <div>Done!</div>
      {
        props.wasCancelled ?
          <div>Partially saved file in {props.file}</div> :
          <div>Saved in {props.file}</div>
      }
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
  onCancelRequest: () => void
}

export const ProcessingOverlay = (props: ProcessingOverlayProps) => {

  const [isDone, setIsDone] = useState(false);
  const [progress, setProgress] = useState<IFFMpegProgressData | null>(null);
  const [error, setError] = useState<FFMpegError | null>(null);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {

      console.log(interval, Date.now());

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

      if (task && task.cancelled) {
        setCancelled(true);
      }

    }, 1000);

    return function cleanup() {
      clearInterval(interval);
    }
  }, [])

  let component: JSX.Element;
  if (error && !cancelled) {
    component = <ProgressError error={error}/>
  } else if (isDone) {
    component = <Done file={props.fileOut} onOk={props.onDone} wasCancelled={cancelled}/>
  } else {
    component = <Progress
      progress={progress}
      out={props.fileOut}
      onCancel={() => {
        setCancelled(true);
        props.onCancelRequest();
      }}/>
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