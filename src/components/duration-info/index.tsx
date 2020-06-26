import React from "react";
import {Box, Paper, Typography} from "@material-ui/core";
import {round, seconds2time} from "../../helpers/math";

export interface DurationInfoProps {
  start: number
  end: number
  className?: string
}

export function DurationInfo({ start, end, className }: DurationInfoProps) {
  return (
    <Paper elevation={0} className={className} variant={'elevation'} square={true}>
      <Box p={1}>
        <Typography noWrap>
          Start: {seconds2time(round(start, 2))} | End: {seconds2time(round(end, 2))} |
          Duration: {seconds2time(round(end - start, 2))}
        </Typography>
      </Box>
    </Paper>
  );
}