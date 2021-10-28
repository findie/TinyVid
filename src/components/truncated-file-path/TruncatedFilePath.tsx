import React from 'react'
import * as path from 'path';
import {Typography, TypographyProps} from "@material-ui/core";
import classes from './TruncatedFilePath.module.scss';
import classNames from "classnames";

type TruncatedFilePathProps = {
  filePath: string
} & TypographyProps;

export function TruncatedFilePath(props:TruncatedFilePathProps){

  const {
    className,
    style,
    filePath,
    ...typography
  } = props;

  const fileName = path.basename(filePath);
  const folderPath = path.dirname(filePath);

  return (
    <div className={classNames(className, classes.root)} style={style}>
      <Typography {...typography} className={classes.folder}>{folderPath}</Typography>
      <Typography {...typography} className={classes.file}>/{fileName}</Typography>
    </div>
  )

}
