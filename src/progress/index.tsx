import React, {useCallback, useState} from 'react';
import css from './style.css'
import {FFMpegError, IFFMpegProgressData} from "ffmpeg-progress-wrapper";
import {shell} from 'electron';
import {Modal} from "../components/modal";
import {Box, Button, CircularProgress, Grid, LinearProgress, Paper, Typography} from '@material-ui/core';
import * as path from 'path';
import {CodeDisplay} from "../components/code";
import {bps2text, seconds2time} from "../helpers/math";
import {AppState} from "../global-stores/AppState.store";
import {ProcessStore} from "../global-stores/Process.store";
import {observer} from "mobx-react";

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

  const eta = props?.progress?.eta || 0;

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
                in {eta > 10 ? seconds2time(eta, 0, true) : 'a few seconds'}</Typography> :
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
              onClick={() => shell.openPath(props.file)}
              variant={"contained"}
              color={"primary"}
            >
              Open File
            </Button>
          </Grid>

          <Grid item>
            <Button
              onClick={() => shell.openPath(path.dirname(props.file))}
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
}

export const ProcessingOverlay = observer(function ProcessingOverlay(props: ProcessingOverlayProps) {

  const fileIn = AppState.file!;
  const fileOut = ProcessStore.fileOut!;
  const processing = ProcessStore.processing;

  const onDone = useCallback(() => {
    return ProcessStore.setProcessing(null);
  }, []);
  const onCancelRequest = useCallback(() => {
    if (ProcessStore.processing) {
      ProcessStore.processing.cancel();
    }
  }, []);

  if (!processing) {
    return null;
  }

  const isDone = processing.done;
  const progress = processing.progress;
  const error = processing.error;
  const cancelled = processing.cancelled;

  let component: JSX.Element;
  if (error && !cancelled) {
    component = <ProgressError error={error} onOk={onDone}/>
  } else if (isDone) {
    component = <Done file={fileOut} onOk={onDone} wasCancelled={cancelled}/>
  } else {
    component = <Progress
      progress={progress}
      out={fileOut}
      onCancel={onCancelRequest}/>
  }

  return (
    <Modal className={css.container}>
      <Paper elevation={3} className={css.title}>
        <Typography noWrap>
          <strong>File:</strong> {path.dirname(fileIn) + path.sep}<strong>{path.basename(fileIn)}</strong>
        </Typography>
      </Paper>
      <div className={css.innerContainer}>
        {component}
      </div>
    </Modal>
  )
});
