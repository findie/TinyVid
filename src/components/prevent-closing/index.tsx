import React, {useCallback, useEffect, useState} from "react";
import {Modal} from "../modal";
import {Box, Button, Grid, Paper, Typography} from "@material-ui/core";
import {ipcRenderer} from 'electron';
import {getCurrentWindow} from '@electron/remote'

export interface PreventClosingProps {
}

export function PreventClosing(props: PreventClosingProps) {

  const [open, setOpen] = useState(false);

  const close = useCallback(function close() {
    getCurrentWindow().destroy();
    setOpen(false);
  }, [setOpen])

  const cancel = useCallback(function cancel() {
    setOpen(false);
  }, [setOpen]);

  const show = useCallback(function show() {
    setOpen(true);
  }, [setOpen]);

  useEffect(() => {
    ipcRenderer.addListener('x-closing-window', show)
    return function cleanup() {
      ipcRenderer.removeListener('x-closing-window', show);
    }
  }, [show]);

  return (
    <Modal open={open}>
      <Paper elevation={3}>
        <Paper elevation={3}>
          <Box padding={1}>
            <Typography align={'center'}><strong>You have a video processing!</strong></Typography>
          </Box>
        </Paper>
        <Box padding={2}>
          <Box paddingBottom={2}>
            <Typography>Are you sure you want to close the app?</Typography>
          </Box>

          <Grid container justify={'flex-end'} spacing={1}>
            <Grid item>
              <Button variant={"contained"} onClick={close}>Yes</Button>
            </Grid>
            <Grid item>
              <Button variant={"contained"} onClick={cancel}>No</Button>
            </Grid>

          </Grid>
        </Box>
      </Paper>
    </Modal>
  )

}
