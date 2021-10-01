/**
 Copyright Findie 2021
 */
import React, {ChangeEvent, useCallback, useState} from "react";
import {Icon, Mark, Paper, Slider, Tooltip} from "@material-ui/core";
import * as css from './style.css'
import {ProcessStore} from "../../global-stores/Process.store";

import VolumeDown from "@material-ui/icons/VolumeDown";
import VolumeUp from "@material-ui/icons/VolumeUp";
import VolumeOff from "@material-ui/icons/VolumeOff";
import Add from '@material-ui/icons/Add';

import {observer} from "mobx-react";
import {AppState} from "../../global-stores/AppState.store";
import classNames from "classnames";
import {Theme} from "../../helpers/theme";
import {eventList} from "../../helpers/events";

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
const sliderFormat = (n: number) => {
 return (
   <div className={css.sliderTooltip}>
     {(n * 100).toFixed(0)}%
     {n >= 1.25 && (<><br/><br/>Volume is above 125%, audio may distort!</>)}
     {n === 0 && (<><br/><br/>Audio is muted, this will slightly increase your video quality</>)}
   </div>
 )

}


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

  const [lastNonMutedVolume, setLastNonMutedVolume] = useState(1);

  const icon = (
    volume === 0 ? <VolumeOff/> :
      volume < 0.75 ? <VolumeDown/> :
        <VolumeUp/>
  );

  const boost = volume >= 1.25;

  const disabled = !AppState.file;

  const toggleVolume = useCallback(() => {
    if (disabled) return;
    if (ProcessStore.volume > 0) {
      eventList.audio.mute();
      ProcessStore.setVolume(0);
    } else {
      eventList.audio.unmute();
      ProcessStore.setVolume(lastNonMutedVolume);
    }
  }, [disabled, lastNonMutedVolume]);

  const setVolume = useCallback((e: ChangeEvent<{}>, v: number | number[]) => {
    eventList.audio.volume({ volume: v as number });
    ProcessStore.setVolume(v as number);
    if (v as number > 0) {
      // never set lastNonMutedVolume to 0 as mute/unmute will then appear to do nothing
      setLastNonMutedVolume(v as number);
    }
  }, [setLastNonMutedVolume]);

  return (
    <div className={classNames(css.root, disabled && css.disabled)}>

      <Tooltip
        title={
          volume > 1.25 ?
            'Volume is above 125%, audio may distort!' :
            volume <= 0 ?
              'Audio is muted, this will slightly increase your video quality' :
              ''
        }
        placement="left"
      >
        <Icon className={classNames(css.icon, disabled && css.disabled)} onClick={toggleVolume}>
          {icon}
          {boost && <Add className={css.extra}/>}
        </Icon>
      </Tooltip>

      <div className={css.popup}>
        <Paper elevation={2} className={css.paper}>
          <Slider
            className={classNames(css.slider, Theme.shouldUseDarkTheme ? css.dark : css.white)}
            disabled={disabled}
            value={volume}
            min={0}
            max={2}
            step={0.05}
            onChange={setVolume}
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
