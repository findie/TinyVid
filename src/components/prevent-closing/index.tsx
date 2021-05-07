import React, {useEffect, useState} from "react";
import {Modal} from "../modal";
import {Box, Button, Grid, Paper, Typography} from "@material-ui/core";
import {ipcRenderer, remote} from 'electron';

export interface PreventClosingProps {
  prevent: boolean
}

export function PreventClosing(props: PreventClosingProps) {

  const [open, setOpen] = useState(false);

  function close() {
    remote.getCurrentWindow().destroy();
    // console.trace('close called')
    setOpen(false);
  }

  function cancel() {
    setOpen(false);
  }

  useEffect(() => {

    const myCloseFn = (e: BeforeUnloadEvent) => {
      console.log(props);
      if (props.prevent) {
        e.returnValue = 'false';
        setOpen(true);
      } else {
        close();
      }
    };

    ipcRenderer.addListener('x-closing-window', myCloseFn)
    return function cleanup() {
      ipcRenderer.removeListener('x-closing-window', myCloseFn);
    }
  }, [props.prevent]);

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
