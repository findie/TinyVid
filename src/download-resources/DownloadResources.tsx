import React from 'react'
import {FFFiles} from "../../common/ff/files";
import {Modal} from "../components/modal";
import {Button, Divider, LinearProgress, Link, Typography} from "@material-ui/core";
import {observer} from "mobx-react";
import {app, shell} from "@electron/remote";
import classes from './DownloadResources.module.scss';
import CheckCircle from "@material-ui/icons/CheckCircle";
import {CodeDisplay} from "../components/code";

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
                <Typography variant="h6" align="center">To complete setup, we will download additional software called FFmpeg.</Typography>
                <CodeDisplay wrap>
                  This software uses a compiled version of <Link onClick={() => shell.openExternal("http://ffmpeg.org")}><b>FFmpeg</b></Link>{' '}
                  licensed under the <Link onClick={() => shell.openExternal("https://www.gnu.org/licenses/gpl-3.0.html")}><b>GPLv3</b></Link>.{' '}<br/>
                  FFmpeg's source can be downloaded <Link onClick={() => shell.openExternal("https://github.com/ffmpeg/FFmpeg/")}><b>here</b></Link>{' '}
                  and binaries can be downloaded <Link onClick={() => shell.openExternal("https://ffbinaries.com/downloads")}><b>here</b></Link>
                </CodeDisplay>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={FFFiles.downloadBins}
                >
                  I Agree - Download
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
