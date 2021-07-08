import React from "react";
import * as css from './style.css';
import {clip, range} from "../../helpers/math";
import {FormControl, InputLabel, MenuItem, Select} from "@material-ui/core";
import {ProcessStore} from "../../Process.store";
import {observer} from "mobx-react";

export interface ConfigConstantQualityProps {
}

export function quality2name(q: number, flavored: boolean = true) {
  // most people don't know the x264 has crf from 0 to 51
  // and they don't need to know

  let q_percentage = 100 - ((q - 18) / 2 * 5);
  const better_than_100 = q_percentage > 100;
  const worse_than_5 = q_percentage < 5;
  q_percentage = clip(0, q_percentage, 100);

  if (flavored) {
    if (q === 18) {
      return `${q_percentage}% (crisp picture)`
    }

    if (q === 22) {
      return `${q_percentage}% (can't really tell the difference)`
    }

    if (q === 28) {
      return `${q_percentage}% (starting to lose some quality)`
    }

    if (q === 32) {
      return `${q_percentage}% (your usual twitter video)`
    }

    if (q === 40) {
      return `${q_percentage}% (potato quality 🥔)`
    }
  }

  if (better_than_100) {
    return `${q_percentage}% +`;
  }
  if (worse_than_5) {
    return `< 5% (oh boy)`;
  }
  return `${q_percentage}%`;
}

export const ConfigConstantQuality = observer(function ConfigConstantQuality(props: ConfigConstantQualityProps) {

  const qualityPreset = ProcessStore.strategyTune;

  return (<div className={css.maxFileSizeConfig}>
    <FormControl>
      <InputLabel id="quality-label">Quality</InputLabel>
      <Select
        labelId={'quality-label'}
        onChange={e => {
          ProcessStore.setStrategyTune(parseInt(e.target.value as string));
        }}
        value={qualityPreset}
      >
        {
          range(18, 44, 2).map(q => (
            <MenuItem value={q} key={q}>{quality2name(q)}</MenuItem>
          ))
        }
      </Select>
    </FormControl>

  </div>);
});
