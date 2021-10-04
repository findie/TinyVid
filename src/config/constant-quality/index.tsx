import React from "react";
import * as css from './style.css';
import {clip} from "../../helpers/math";
import {FormControl, InputLabel, MenuItem, Select} from "@material-ui/core";
import {ProcessStore} from "../../global-stores/Process.store";
import {observer} from "mobx-react";
import {RendererSettings} from "../../helpers/settings";
import {trace} from "mobx";

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
  const qualityOptions = ProcessStore.processor.qualityOptions;

  // this is here just because ProcessStore.processor isn't observable for some reason
  // and RendererSettings.settings.processor will re-render the component
  const processorName = RendererSettings.settings.processor;

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
          qualityOptions.map(({ text, value }) => (
            <MenuItem value={value} key={`${value}-${processorName}`}>{text}</MenuItem>
          ))
        }
      </Select>
    </FormControl>

  </div>);
});
