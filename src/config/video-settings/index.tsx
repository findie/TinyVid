import React, {useEffect, useState} from "react";
import * as css from './style.css';
import {FFHelpers} from "../../../electron/ffhelpers";

export type ConfigVideoSettingsData = FFHelpers.VideoSettings;

export interface ConfigVideoSettingsProps {
  onChange: (quality: ConfigVideoSettingsData) => void
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
      <option value={'original'}>Original Size</option>
      <option value={1080}>1080p</option>
      <option value={720}>720p</option>
      <option value={480}>480p</option>
      <option value={360}>360p</option>
    </select>

    <select
      onChange={e => setVideoFPS(parseInt(e.target.value))}
      value={videoFPS}
    >
      <option value={'original'}>Original FPS</option>
      <option value={60}>60 FPS</option>
      <option value={48}>48 FPS</option>
      <option value={30}>30 FPS</option>
      <option value={25}>25 FPS</option>
      <option value={24}>24 FPS</option>
    </select>

  </div>);
}