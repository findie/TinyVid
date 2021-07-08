import React, {FormEvent, useState} from "react";
import * as css from './style.css';
import {clip} from "../../helpers/math";
import {FormControl, InputBaseComponentProps, InputLabel, MenuItem, Select, TextField} from "@material-ui/core";
import NumberFormat from 'react-number-format';
import {ProcessStore} from "../../Process.store";
import {observer} from "mobx-react";

export interface ConfigMaxFileSizeProps {
}

const defaultSizes = [
  { size: 8, text: ' 8 MB (Discord Free)' },
  { size: 10, text: '10 MB' },
  { size: 50, text: '50 MB (Discord Nitro Classic)' },
  { size: 64, text: '64 MB (WhatsApp)' },
  { size: 100, text: '100 MB (Discord Nitro)' },
]

export const ConfigMaxFileSize = observer(function ConfigMaxFileSize(props: ConfigMaxFileSizeProps) {

  const size = ProcessStore.strategyTune;
  const [sizeIsCustom, setSizeIsCustom] = useState(!defaultSizes.find(x => x.size === size));

  // @ts-ignore
  return (<div className={css.maxFileSizeConfig}>
    <FormControl>
      <InputLabel id="size">Size</InputLabel>

      <Select
        onChange={e => {
          if (e.target.value === 'custom') {
            setSizeIsCustom(true);
          } else {
            setSizeIsCustom(false);
            ProcessStore.setStrategyTune(parseInt(e.target.value as string))
          }
        }}
        value={sizeIsCustom ? 'custom' : size}
        labelId={'size'}
      >
        {defaultSizes.map(({ size, text }) =>
          <MenuItem value={size} key={size}>{text}</MenuItem>
        )}
        <MenuItem value={'custom'}>Custom</MenuItem>
      </Select>
    </FormControl>

    {sizeIsCustom ?
      <div>

        <TextField
          className={css.customInput}
          onChange={e => ProcessStore.setStrategyTune(clip(1, parseInt(e.target.value), 10000))}
          onBlur={e => !e.target.value && ProcessStore.setStrategyTune(10)}
          value={size}
          InputProps={{
            inputComponent: MBNumberFormatCustom,
          }}
        />
      </div> :
      null
    }
  </div>);
});


interface MBNumberFormatCustomProps extends InputBaseComponentProps {
}

function MBNumberFormatCustom(props: MBNumberFormatCustomProps) {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      defaultValue={props.defaultValue?.toString()}
      onValueChange={(values) => {
        onChange && onChange({
          target: {
            name: props.name,
            value: values.value,
          }
        } as unknown as FormEvent<HTMLInputElement>);
      }}
      thousandSeparator
      isNumericString
      suffix=" MB"
      min={1}
      max={1000}
      step={1}
    />
  );
}

