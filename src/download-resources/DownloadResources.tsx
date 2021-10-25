import React from 'react'
import {FFFiles} from "../../common/ff/files";
import {Modal} from "../components/modal";
import {Button, Divider, LinearProgress, Typography} from "@material-ui/core";
import {observer} from "mobx-react";
import {app} from "@electron/remote";
import classes from './DownloadResources.module.scss';
import CheckCircle from "@material-ui/icons/CheckCircle";

function restart() {
  app.relaunch();
  app.exit();
}

export const DownloadResources = observer(function DownloadResources() {

  const hasBins = FFFiles.ffmpegExists && FFFiles.ffprobeExists;

  if (hasBins) {
    return null;
  }

  const dlProgress = (FFFiles.downloadProgress.ffprobe + FFFiles.downloadProgress.ffprobe) / 2;

  return (
    <Modal open className={classes.root}>
      <Typography variant="h5" align="center">Completing first time setup</Typography>
      <Divider/>

      <div className={classes.container}>
        {!FFFiles.downloadDone && (
          <>
            {!FFFiles.downloading && !FFFiles.downloadError && (
              <>
                <Typography variant="h6" align="center">Some assets are required before running {app.name}</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={FFFiles.downloadBins}
                >
                  Start Download
                </Button>
              </>
            )}
            {FFFiles.downloading && (
              <>
                <Typography variant="h6" align="center">Downloading assets</Typography>
                <LinearProgress
                  className={classes.progress}
                  variant={dlProgress > 0 ? 'determinate' : 'indeterminate'}
                  value={dlProgress * 100}
                />
              </>
            )}
            {FFFiles.downloadError && (
              <>
                <Typography variant="h6" align="center">Something went wrong while downloading the assets</Typography>
                <Typography variant="h6" align="center">Please check your internet connection</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={FFFiles.downloadBins}
                >
                  Try again
                </Button>
              </>
            )}
          </>
        )}

        {FFFiles.downloadDone && (
          <>
            <Typography variant="h6" align="center">Everything is ready!</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={restart}
              startIcon={<CheckCircle/>}
            >
              Finish and Restart
            </Button>
          </>
        )}
      </div>
    </Modal>
  )
});
