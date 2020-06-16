import React, {useEffect, useState} from "react";
import * as css from './style.css';
import {DetailsComms} from "../../helpers/comms";
import {VideoSettings} from "../../../electron/types";
import {FormControl, InputLabel, MenuItem, Select, Box} from "@material-ui/core";

export type ConfigVideoSettingsData = VideoSettings;

export interface ConfigVideoSettingsProps {
  onChange: (quality: ConfigVideoSettingsData) => void

  details: DetailsComms.SimpleVideoDetails | null
}

export const ConfigVideoSettingsDefault: ConfigVideoSettingsData = {
  fps: 'original',
  height: 'original'
};

export function ConfigVideoSettings(props: ConfigVideoSettingsProps) {

  const originalVideoHeight: number | null = props.details?.height || null;
  const originalVideoFPS: number | null = props.details?.fps || null;

  const [videoHeight, setVideoHeight] = useState<'original' | number>('original');
  const [videoFPS, setVideoFPS] = useState<'original' | number>('original');

  useEffect(() => {
    props.onChange({
      height: videoHeight,
      fps: videoFPS
    });
  }, [videoFPS, videoHeight]);

  useEffect(() => {
    if (!originalVideoFPS || originalVideoFPS <= videoFPS) {
      setVideoFPS('original');
    }
    if (!originalVideoHeight || originalVideoHeight <= videoHeight) {
      setVideoHeight('original');
    }
  }, [props.details]);

  return (<div className={css.maxFileSizeConfig}>
    <Box marginRight={1}>
    <FormControl>
      <InputLabel id={'frame-size'}>Resolution</InputLabel>
      <Select
        labelId={'frame-size'}
        onChange={e => setVideoHeight(
          e.target.value === 'original' ?
            'original' :
            parseInt(e.target.value as string)
        )}
        value={videoHeight}
      >
        <MenuItem value={'original'}>{originalVideoHeight ? originalVideoHeight + 'p' : 'Original Size'}</MenuItem>
        {
          [1080, 720, 480, 360]
            .filter(x => x < (props.details?.height || Infinity))
            .map(x => <MenuItem value={x} key={x}>{x}p</MenuItem>)
        }
      </Select>
    </FormControl>
    </Box>

    <FormControl>
      <InputLabel id={'video-fps'}>FPS</InputLabel>
      <Select
        onChange={e => setVideoFPS(
          e.target.value === 'original' ?
            'original' :
            parseInt(e.target.value as string)
        )}
        value={videoFPS}
        labelId={'video-fps'}
      >
        <MenuItem value={'original'}>{props.details?.fps ? props.details.fps + ' FPS' : 'Original FPS'}</MenuItem>
        {
          [144, 120, 60, 48, 30, 24, 20, 15]
            .filter(x => x < (props.details?.fps || Infinity))
            .map(x => <MenuItem value={x} key={x}>{x} FPS</MenuItem>)
        }
      </Select>
    </FormControl>

  </div>);
}