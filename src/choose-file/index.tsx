import React, {useState} from "react";
import css from './style.css'
import {remote} from 'electron'

import {Box, Button, Tooltip, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {Theme} from "../helpers/theme";
import {VideoLibrary} from "@material-ui/icons"

export interface ChooseFileProps {
  fileCB: (path: string) => void
  className?: string
}

const styles = () => makeStyles({
  'textField': {
    background: Theme.current().palette.background.default
  }
})

export const ChooseFile = (props: ChooseFileProps) => {

  const classes = styles()();

  const [file, setFile] = useState('');

  const chooseFileCallback = async () => {
    const files = await remote.dialog.showOpenDialog(
      remote.getCurrentWindow(),
      {
        properties: ['openFile'],
        filters: [
          {
            name: 'Video',
            extensions: ['mp4', 'mov', 'm4v']
          }
        ]
      });

    if (!files.canceled && files.filePaths[0]) {
      setFile(files.filePaths[0]);
      props.fileCB(files.filePaths[0]);
    }
  }

  return (
    <Box
      padding={1}
      className={css.main + ' ' + (props.className || '')}
      onClick={chooseFileCallback}
    >
      <Button
        variant="contained"
        className={css.button}
        startIcon={<VideoLibrary/>}
      >
        Open File
      </Button>
      <Box paddingLeft={2} className={css.text + ' ' + classes.textField}>
        <Tooltip title={file ? file : 'No file chosen...'} arrow>
          <Typography noWrap>
            {file ? file : 'No file chosen...'}
          </Typography>
        </Tooltip>
      </Box>
    </Box>
  )

}