import React from "react";
import {Box, Paper, Typography} from "@material-ui/core";
import {round, seconds2time} from "../../helpers/math";
import {observer} from "mobx-react";
import {AppState} from "../../AppState.store";

export interface DurationInfoProps {
  className?: string
}

export const DurationInfo = observer(function DurationInfo({ className }: DurationInfoProps) {
  const { start, end } = AppState.trimRange;

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
});
