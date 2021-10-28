import React, {useCallback, useEffect, useState} from "react";
import css from './style.css'

import {Box, Button, Icon, Tooltip, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

import InsertDriveFile from '@material-ui/icons/InsertDriveFile'
import VideoLibrary from '@material-ui/icons/VideoLibrary'

import classNames from 'classnames';
import {AppState} from "../global-stores/AppState.store";
import {createPortal} from "react-dom";
import {eventList} from "../helpers/events";

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
    setIsHovering(false);

    const files = e.dataTransfer?.files;
    const firstFile = files[0];

    if (!firstFile) return;

    eventList.file.choose({ type: 'dnd' });

    AppState.handleFileInput(
      Array.prototype.slice.apply(files).map(x => x.path)
    );

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      console.log('File Path of dragged files: ', f.path)
    }
  }, [setIsHovering]);

  useEffect(() => {

    document.body.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsHovering(true);
    });

    ////

    document.body.addEventListener('dragenter', (e) => {
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
          onClick={() => setIsHovering(false)}
        >
          <Icon color="primary" fontSize="large">
            <InsertDriveFile fontSize="large"/>
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

const styles = makeStyles(theme => ({
  'textField': {
    background: theme.palette.background.default
  }
}));

export const ChooseFile = (props: ChooseFileProps) => {

  const classes = styles();

  const file = AppState.file;

  return (
    <>
      <DocumentDropZone/>
      <Box
        padding={1}
        className={classNames(css.main, props.className)}
        onClick={AppState.requestFileInputDialogFlow}
      >
        <Tooltip title="Open file or choose multiple to add to queue" arrow>
          <Button
            variant="contained"
            className={css.button}
            startIcon={<VideoLibrary/>}
          >
            Open File(s)
          </Button>
        </Tooltip>
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
