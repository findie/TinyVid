import React, {useEffect, useState} from "react";
import * as css from './style.css';
import {clip} from "../../helpers/math";
import {FFHelpers} from "../../../electron/helpers/ff";

export interface ConfigMaxFileSizeProps {
  onChange: (size: number) => void
}

type SizePresets = number | 'custom'

export const ConfigMaxFileSizeDefaultSize = 8;
export const ConfigMaxFileSizeDefaultSpeedOrQuality = FFHelpers.encodingSpeedPresets.indexOf('medium');

export function ConfigMaxFileSize(props: ConfigMaxFileSizeProps) {

  const [sizePreset, setSizePreset] = useState<SizePresets>(ConfigMaxFileSizeDefaultSize);
  const [customSize, setCustomSize] = useState<number>(100);

  useEffect(() => {
    const value = sizePreset === 'custom' ? customSize : sizePreset;
    props.onChange(value);
  }, [sizePreset, customSize]);

  return (<div className={css.maxFileSizeConfig}>

    <select
      onChange={e => setSizePreset(e.target.value === 'custom' ? 'custom' : parseInt(e.target.value))}
      value={sizePreset}
    >
      <option value={8}> 8 MB (discord free)</option>
      <option value={10}>10 MB</option>
      <option value={50}>50 MB (discord nitro)</option>
      <option value={100}>100 MB</option>
      <option value={'custom'}>Custom</option>
    </select>

    {sizePreset === 'custom' ?
      <div>
        <input className={css.customInput}
               type={'number'}
               onChange={e => setCustomSize(clip(1, parseInt(e.target.value), 1000))}
               onBlur={e => !e.target.value && setCustomSize(1)}
               value={customSize}
               min={1}
               max={1000}
               step={1}
        />MB
      </div> :
      null
    }

  </div>);
}