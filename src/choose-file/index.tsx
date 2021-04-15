import React, {useCallback, useEffect, useState} from "react";
import css from './style.css'
import {remote} from 'electron'

import {Box, Button, Icon, Tooltip, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {Theme} from "../helpers/theme";
import {InsertDriveFile, VideoLibrary} from "@material-ui/icons"

import classNames from 'classnames';
import {AppState} from "../AppState.store";
import {createPortal} from "react-dom";

function DocumentDropZone() {

  const [isHovering, setIsHovering] = useState(false);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHovering(false);
  }, [setIsHovering]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files: File[] = (e as any).dataTransfer.files;
    const firstFile = files[0];

    if (!firstFile) return;

    AppState.setFile(firstFile.path);

    for (const f of files) {
      console.log('File Path of dragged files: ', f.path)
    }
    setIsHovering(false);
  }, [setIsHovering]);

  useEffect(() => {

    document.body.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsHovering(true);
    });

    document.body.addEventListener('dragenter', (e)=> {
      e.preventDefault();
      e.stopPropagation();
      setIsHovering(true);
    });

  }, [setIsHovering]);

  return (
    <>
      {isHovering && createPortal(
        <div
          className={css.dropArea}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Icon color="primary" fontSize="large">
            <InsertDriveFile fontSize="large" />
          </Icon>
          <Typography variant="h4" color="textPrimary">Drop your file here</Typography>
        </div>,
        document.body,
      )}
    </>
  );
}

export interface ChooseFileProps {
  className?: string
}

const styles = () => makeStyles({
  'textField': {
    background: Theme.current.palette.background.default
  }
})

export const ChooseFile = (props: ChooseFileProps) => {

  const classes = styles()();

  const file = AppState.file;

  const chooseFileCallback = async () => {
    const files = await remote.dialog.showOpenDialog(
      remote.getCurrentWindow(),
      {
        properties: ['openFile'],
      });

    if (!files.canceled && files.filePaths[0]) {
      AppState.setFile(files.filePaths[0]);
    }
  }

  return (
    <>
      <DocumentDropZone/>
      <Box
        padding={1}
        className={classNames(css.main, props.className)}
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
    </>
  )

}
