import React, {useState} from "react";
import * as css from './style.css';
import {range} from "../../helpers/math";
import {FFHelpers} from "../../../electron/ffhelpers";

export interface ConfigConstantQualityProps {
  onChange: (quality: number) => void
}

export const ConfigConstantQualityDefaultQuality = 8;
export const ConfigConstantQualityDefaultSpeedOrQuality = FFHelpers.encodingSpeedPresets.indexOf('medium');

function quality2name(q: number) {
  if (q === 18) {
    return `${q} (crisp picture)`
  }

  if (q === 22) {
    return `${q} (can't really tell the difference)`
  }

  if (q === 28) {
    return `${q} (starting to lose some quality)`
  }

  if (q === 32) {
    return `${q} (your usual twitter video)`
  }

  if (q === 40) {
    return `${q} (potato quality)`
  }

  return q;
}

export function ConfigConstantQuality(props: ConfigConstantQualityProps) {

  const [qualityPreset, setQualityPreset] = useState<number>(ConfigConstantQualityDefaultQuality);


  return (<div className={css.maxFileSizeConfig}>

    <select
      onChange={e => {
        setQualityPreset(parseInt(e.target.value));
        props.onChange(parseInt(e.target.value));
      }}
      value={qualityPreset}
    >
      {
        range(18, 44, 2).map(q => (
          <option value={q} key={q}>{quality2name(q)}</option>
        ))
      }
    </select>


  </div>);
}