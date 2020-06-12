import React, {useEffect, useState} from "react";
import * as css from './style.css';
import {DetailsComms} from "../../helpers/comms";
import {VideoSettings} from "../../../electron/types";

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

  const [videoHeight, setVideoHeight] = useState<'original' | number>('original');
  const [videoFPS, setVideoFPS] = useState<'original' | number>('original');

  useEffect(() => {
    props.onChange({
      height: videoHeight,
      fps: videoFPS
    });
  }, [videoFPS, videoHeight])

  return (<div className={css.maxFileSizeConfig}>
    Video Settings:
    <select
      onChange={e => setVideoHeight(parseInt(e.target.value))}
      value={videoHeight}
    >
      <option value={'original'}>{props.details?.height ? props?.details?.height + 'p' : 'Original Size'}</option>
      {
        [1080, 720, 480, 360]
          .filter(x => x < (props.details?.height || Infinity))
          .map(x => <option value={x} key={x}>{x}p</option>)
      }
    </select>

    <select
      onChange={e => setVideoFPS(parseInt(e.target.value))}
      value={videoFPS}
    >
      <option value={'original'}>{props.details?.fps ? props.details.fps + ' FPS' : 'Original FPS'}</option>
      {
        [144, 120, 60, 48, 30, 24, 20, 15]
          .filter(x => x < (props.details?.fps || Infinity))
          .map(x => <option value={x} key={x}>{x} FPS</option>)
      }
    </select>

  </div>);
}