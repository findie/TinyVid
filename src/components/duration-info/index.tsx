import React from "react";
import {Box, Paper, Typography} from "@material-ui/core";

export interface DurationInfoProps {
  start: number
  end: number
  className?: string
}

export function DurationInfo({ start, end, className }: DurationInfoProps) {
  return (
    <Paper elevation={0} className={className} variant={'elevation'} square={true}>
      <Box p={1}>
        <Typography>
          Start: {start.toFixed(2)}s | End: {end.toFixed(2)}s | Duration: {(end - start).toFixed(2)}s
        </Typography>
      </Box>
    </Paper>
  );
}