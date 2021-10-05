import React from "react";
import * as css from './style.css';
import {clip} from "../../helpers/math";
import {FormControl, InputLabel, MenuItem, Select, Typography} from "@material-ui/core";
import {ProcessStore} from "../../global-stores/Process.store";
import {observer} from "mobx-react";
import {RendererSettings} from "../../helpers/settings";
import {trace} from "mobx";

export interface ConfigConstantQualityProps {
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
            <MenuItem value={value} key={`${value}-${processorName}`}>
              {text}
              <span className={css.qualitySpan}>
                {ProcessStore.processor.qualityUnit} {value}
              </span>
            </MenuItem>
          ))
        }
      </Select>
    </FormControl>

  </div>);
});
