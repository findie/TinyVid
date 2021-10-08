import React from "react";
import * as css from './style.css';
import {FormControl, InputLabel, MenuItem, Select} from "@material-ui/core";
import {ProcessStore} from "../../global-stores/Process.store";
import {observer} from "mobx-react";
import {RendererSettings} from "../../helpers/settings";
import {useProcess} from "../../global-stores/contexts/Process.context";

export interface ConfigConstantQualityProps {
  disabled?: boolean
}

export const ConfigConstantQuality = observer(function ConfigConstantQuality(props: ConfigConstantQualityProps) {

  const store = useProcess();

  const qualityPreset = store.strategy.tune;
  const qualityOptions = ProcessStore.processor.qualityOptions;

  // this is here just because ProcessStore.processor isn't observable for some reason
  // and RendererSettings.settings.processor will re-render the component
  const processorName = RendererSettings.settings.processor;

  return (<div className={css.maxFileSizeConfig}>
    <FormControl disabled={props.disabled}>
      <InputLabel id="quality-label">Quality</InputLabel>
      <Select
        labelId={'quality-label'}
        onChange={e => {
          store.setStrategyTune(parseInt(e.target.value as string));
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
