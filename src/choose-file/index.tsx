import React, {useState} from "react";
import css from './style.css'
import {remote} from 'electron'

import {Box, Button, Typography} from "@material-ui/core";

export interface ChooseFileProps {
  fileCB: (path: string) => void
}

export const ChooseFile = (props: ChooseFileProps) => {

  const [file, setFile] = useState('');

  const chooseFileCallback = async () => {
    const files = await remote.dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        {
          name: 'Video',
          extensions: ['mp4']
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
      className={css.main}
      onClick={chooseFileCallback}
    >
      <Button
        variant="contained"
        className={css.button}
      >
        Select File
      </Button>
      <Box marginLeft={2}>
        <Typography>
          {file ? file : 'No file chosen...'}
        </Typography>
      </Box>
    </Box>
  )

}