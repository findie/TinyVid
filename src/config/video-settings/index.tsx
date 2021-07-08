import React, {useEffect, useState} from "react";
import * as css from './style.css';
import {DetailsComms} from "../../helpers/comms";
import {VideoSettings} from "../../../electron/types";
import {FormControl, InputLabel, MenuItem, Select, Box} from "@material-ui/core";
import {observer} from "mobx-react";
import {ProcessStore} from "../../Process.store";
import {toJS} from "mobx";

export type ConfigVideoSettingsData = VideoSettings;

export interface ConfigVideoSettingsProps {
}

export const ConfigVideoSettings = observer(function ConfigVideoSettings(props: ConfigVideoSettingsProps) {

  const details = ProcessStore.simpleVideoDetails;

  const originalVideoHeight: number | null = details?.height || null;
  const originalVideoFPS: number | null = details?.fps || null;

  const videoHeight = ProcessStore.videoSettings.height;
  const videoFPS = ProcessStore.videoSettings.fps;

  useEffect(() => {
    if (originalVideoFPS && originalVideoFPS <= videoFPS) {
      ProcessStore.setVideoSettings('fps','original');
    }
    if (originalVideoHeight && originalVideoHeight <= videoHeight) {
      ProcessStore.setVideoSettings('height','original');
    }
  }, [originalVideoHeight, originalVideoFPS]);

  return (<div className={css.maxFileSizeConfig}>
    <Box marginRight={2}>
    <FormControl>
      <InputLabel id={'frame-size'}>Resolution</InputLabel>
      <Select
        labelId={'frame-size'}
        onChange={e => ProcessStore.setVideoSettings('height',
          e.target.value === 'original' ?
            'original' :
            parseInt(e.target.value as string)
        )}
        value={videoHeight}
      >
        <MenuItem value={'original'}>
          {originalVideoHeight ? originalVideoHeight + 'p (original)' : 'Original Size'}
        </MenuItem>
        {
          [1440, 1080, 720, 480, 360]
            .filter(x => x < (details?.height || Infinity))
            .map(x => <MenuItem value={x} key={x}>{x}p</MenuItem>)
        }
      </Select>
    </FormControl>
    </Box>

    <FormControl>
      <InputLabel id={'video-fps'}>FPS</InputLabel>
      <Select
        onChange={e => ProcessStore.setVideoSettings('fps',
          e.target.value === 'original' ?
            'original' :
            parseInt(e.target.value as string)
        )}
        value={videoFPS}
        labelId={'video-fps'}
      >
        <MenuItem value={'original'}>
          {details?.fps ? details.fps + ' FPS (original)' : 'Original FPS'}
        </MenuItem>
        {
          [144, 120, 60, 48, 30, 24, 20, 15]
            .filter(x => x < (details?.fps || Infinity))
            .map(x => <MenuItem value={x} key={x}>{x} FPS</MenuItem>)
        }
      </Select>
    </FormControl>

  </div>);
});
