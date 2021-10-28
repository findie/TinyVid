import React from 'react'
import {observer} from "mobx-react";
import {useProcess} from "../global-stores/contexts/Process.context";
import {FormControl, InputLabel, MenuItem, Select} from "@material-ui/core";
import {ConfigMaxFileSize} from "./max-file-size";
import {ConfigConstantQuality} from "./constant-quality";

type VideoStrategyProps = {
  disabled?: boolean
}

export const VideoStrategy = observer(function VideoStrategy(props: VideoStrategyProps){
  const store = useProcess();

  return (
    <>
      <FormControl disabled={props.disabled}>
        <InputLabel id="strategy-label">Output must</InputLabel>
        <Select
          labelId={"strategy-label"}
          value={store.strategy.type}
          variant={"standard"}
          onChange={
            e => {
              if (e.target.value === 'max-file-size') {
                store.setStrategyType('max-file-size');
              } else {
                store.setStrategyType('constant-quality');
              }
            }
          }
        >
          <MenuItem value={'max-file-size'}>have max file size of</MenuItem>
          <MenuItem value={'constant-quality'}>be constant quality of</MenuItem>
        </Select>
      </FormControl>

      {store.strategy.type === 'max-file-size' ?
        <ConfigMaxFileSize disabled={props.disabled}/> :
        <ConfigConstantQuality disabled={props.disabled}/>
      }
    </>
  )
})
