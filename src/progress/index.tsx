import React, {useEffect, useState} from 'react';
import css from './style.css'
import {FFMpegError, IFFMpegProgressData} from "ffmpeg-progress-wrapper";
import {remote} from 'electron';
import {TrimComms} from "../helpers/comms";
import {Modal} from "../components/modal";
import {Box, Button, CircularProgress, Grid, LinearProgress, Paper, Typography} from '@material-ui/core';
import * as path from 'path';
import moment from "moment";
import {CodeDisplay} from "../components/code";
import {quality2name} from "../config/constant-quality";
import {bps2text} from "../helpers/math";

interface ProgressProps {
  out: string
  progress: IFFMpegProgressData | null
  onCancel: () => void
}

const Progress = (props: ProgressProps) => {

  const [cancelled, setCancelled] = useState(false);

  const quality: null | number = (
    (props?.progress?.quality?.length || 0) &&
    (props?.progress?.quality[0] || [])[0]
  ) ?? null;

  const firstLine: string[] = [
    `Speed: ${(props?.progress?.speed || 0).toFixed(2)}x`,
    `Bitrate: ${bps2text(props.progress?.bitrate ?? 0)}`
  ];

  // fixme quality for faster presets is erroneous
  //       since faster presets are more sloppy, they allow higher avg bitrate
  //       and thus quantization decreases (internal frame quality increases)
  //       but encoder truggles to keep up and the result is a worse quality than advertised
  // if (quality !== null) {
  //   firstLine.push(`Quality: ${quality2name(quality - 5, false)}`);
  // }

  console.log(props.progress);

  return (
    <div className={css.progressContainer}>
      <LinearProgress
        variant="determinate"
        value={(props?.progress?.progress || 0) * 100}
        className={css.progress}
      />

      <div className={css.info}>
        <Typography noWrap>{firstLine.join(' | ')}</Typography>
        {
          cancelled ?
            <Typography noWrap>Cancelling the process</Typography> :
            props?.progress?.eta ?
              <Typography noWrap>Finishing
                in {moment(Date.now() + (props?.progress?.eta || 0) * 1000).fromNow(true)}</Typography> :
              <Typography noWrap>Starting the process</Typography>
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
  onOk: () => void
}

const ProgressError = (props: ProgressErrorProps) => {
  // todo: maybe we can use ErrorDisplay?
  return (
    <div style={{ minWidth: '525px' }}>
      <Typography align={"center"}>
        <strong>Oops...</strong> something went wrong!
      </Typography>
      <CodeDisplay className={css.maxHeightError}>{props.error.message}</CodeDisplay>
      <Box marginTop={2}>
        <Grid container spacing={2} justify={"flex-end"} wrap={"nowrap"}>

          <Grid item>
            <Button variant={"contained"} color={"secondary"} onClick={() => {
              remote.shell.openPath(`https://github.com/legraphista/QuickTrim/issues`);
            }}>
              View existing reports
            </Button>
          </Grid>

          <Grid item>
            <Button variant={"contained"} color={"primary"} onClick={() => {

              const codeBlock = '```';
              const c = '`';
              const title = 'Rendering issue: ' + props.error.message.split('\n')[0];
              const contents = `
Code: ${c}${props.error.code}${c}
Signal: ${c}${props.error.signal}${c}
Args:
${codeBlock}
${props.error.args.join(' ')}          
${codeBlock}

Message: 
${codeBlock}
${props.error.message}
${codeBlock}
`
              remote.shell.openPath(`https://github.com/legraphista/QuickTrim/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(contents)}`);
            }}>
              Submit error report
            </Button>
          </Grid>

          <Grid item>
            <Button variant={"contained"} onClick={props.onOk}>
              Ok
            </Button>
          </Grid>
        </Grid>
      </Box>
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
      <Typography variant={"h5"} className={css.center}>Done!</Typography>
      <Typography className={css.center}>
        Your file has been
        {
          props.wasCancelled ?
            <strong> partially </strong> : ' '
        }
        saved at:
      </Typography>
      <Box marginTop={1} marginBottom={2}>
        <CodeDisplay className={css.center} mono={false}>
          {props.file}
        </CodeDisplay>
      </Box>
      <Box className={css.center}>
        <Grid container spacing={2} justify={"flex-end"}>
          <Grid item>
            <Button
              onClick={() => remote.shell.openPath(props.file)}
              variant={"contained"}
              color={"primary"}
            >
              Open File
            </Button>
          </Grid>

          <Grid item>
            <Button
              onClick={() => remote.shell.openPath(path.dirname(props.file))}
              variant={"contained"}
              color={"secondary"}
            >
              Open Location
            </Button>
          </Grid>

          <Grid item>
            <Button
              onClick={props.onOk}
              variant={"contained"}
            >
              Ok
            </Button>
          </Grid>
        </Grid>
      </Box>
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
        clearInterval(interval);
      }

      if (task?.progress) {
        setProgress(task.progress);
      }

      if (!task || task.done) {
        setIsDone(true);
        clearInterval(interval);
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
    component = <ProgressError error={error} onOk={props.onDone}/>
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
        <Typography noWrap>
          <strong>File:</strong> {path.dirname(props.fileIn) + path.sep}<strong>{path.basename(props.fileIn)}</strong>
        </Typography>
      </Paper>
      <div className={css.innerContainer}>
        {component}
      </div>
    </Modal>
  )
}