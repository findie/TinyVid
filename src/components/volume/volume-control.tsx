/**
 Copyright Findie 2021
 */
import React, {useCallback} from "react";
import {Icon, Mark, Paper, Slider, Tooltip} from "@material-ui/core";
import * as css from './style.css'
import {ProcessStore} from "../../Process.store";

import VolumeDown from "@material-ui/icons/VolumeDown";
import VolumeUp from "@material-ui/icons/VolumeUp";
import VolumeOff from "@material-ui/icons/VolumeOff";
import Add from '@material-ui/icons/Add';

import {observer} from "mobx-react";
import {AppState} from "../../AppState.store";
import classNames from "classnames";
import {Theme} from "../../helpers/theme";

const sliderMarks: Mark[] = [
  { value: 2, label: '200%' },
  { value: 1.75, label: '175%' },
  { value: 1.5, label: '150%' },
  { value: 1.25, label: '125%' },
  { value: 1, label: '100%' },
  { value: 0.75, label: '75%' },
  { value: 0.5, label: '50%' },
  { value: 0.25, label: '25%' },
  { value: 0, label: '0%' },
];
const sliderFormat = (n: number) => `${(n * 100).toFixed(0)}%`


function SliderValueLabelComponent(props: { children: React.ReactElement, open: boolean, value: number }) {
  const { children, open, value } = props;

  return (
    <Tooltip open={open} enterTouchDelay={0} placement="left" title={value}>
      {children}
    </Tooltip>
  );
}

export const VolumeControl = observer(function VolumeControl() {

  const volume = ProcessStore.volume;

  const icon = (
    volume === 0 ? <VolumeOff/> :
      volume < 0.75 ? <VolumeDown/> :
        <VolumeUp/>
  );

  const boost = volume > 1.25;

  const disabled = !AppState.file;

  const toggleVolume = useCallback(() => {
    if (disabled) return;
    ProcessStore.setVolume(ProcessStore.volume > 0 ? 0 : 1);
  }, [disabled]);

  return (
    <div className={classNames(css.root, disabled && css.disabled)}>
      <Icon className={classNames(css.icon, disabled && css.disabled)} onClick={toggleVolume}>
        {icon}
        {boost && <Add className={css.extra}/>}
      </Icon>
      <div className={css.popup}>
        <Paper elevation={2} className={css.paper}>
          <Slider
            className={classNames(css.slider, Theme.shouldUseDarkTheme ? css.dark : css.white)}
            disabled={disabled}
            value={volume}
            min={0}
            max={2}
            step={0.05}
            onChange={(e, v) => ProcessStore.setVolume(v as number)}
            orientation="vertical"
            valueLabelDisplay="auto"
            valueLabelFormat={sliderFormat}
            marks={sliderMarks}
            ValueLabelComponent={SliderValueLabelComponent}
          />
        </Paper>
      </div>
    </div>
  );

});
