import React from 'react';
import css from './style.css'
import {IFFMpegProgressData} from "ffmpeg-progress-wrapper";
import {remote} from 'electron';

export interface ProgressProps {
  out?: string
  progress: IFFMpegProgressData
}

export const Progress = (props: ProgressProps) => {

  return (
    <div className={css.overlay}>
      <div className={css.dialog}>
        <div>{props.out}</div>
        <div>Progress: {((props.progress.progress || 0) * 100).toFixed(2)}%</div>
        <div>Speed: {(props.progress.speed || 0).toFixed(2)}x</div>
        <div>ETA: {((props.progress.eta || 0) / 1000).toFixed(2)}s</div>
      </div>
    </div>
  )

}

export interface DoneProps {
  file: string
  onOk: () => void
}

export const Done = (props: DoneProps) => {
  return (
    <div className={css.overlay}>
      <div className={css.dialog}>
        <div>Done, saved in:</div>
        <div>{props.file}</div>
        <div>
          <button onClick={props.onOk}>Ok</button>
          <button onClick={() => remote.shell.openPath(props.file)}>Open</button>
        </div>
      </div>
    </div>
  )
}