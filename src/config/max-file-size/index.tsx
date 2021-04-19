import React, {FormEvent, useEffect, useState} from "react";
import * as css from './style.css';
import {clip} from "../../helpers/math";
import {FFHelpers} from "../../../electron/helpers/ff";
import {FormControl, InputBaseComponentProps, InputLabel, MenuItem, Select, TextField} from "@material-ui/core";
import NumberFormat from 'react-number-format';

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

  // @ts-ignore
  // @ts-ignore
  return (<div className={css.maxFileSizeConfig}>
    <FormControl>
      <InputLabel id="size">Size</InputLabel>

      <Select
        onChange={e => setSizePreset(e.target.value === 'custom' ? 'custom' : parseInt(e.target.value as string))}
        value={sizePreset}
        labelId={'size'}
      >
        <MenuItem value={8}> 8 MB (Discord Free)</MenuItem>
        <MenuItem value={10}>10 MB</MenuItem>
        <MenuItem value={50}>50 MB (Discord Nitro Classic)</MenuItem>
        <MenuItem value={64}>64 MB (WhatsApp)</MenuItem>
        <MenuItem value={100}>100 MB (Discord Nitro)</MenuItem>
        <MenuItem value={'custom'}>Custom</MenuItem>
      </Select>
    </FormControl>

      {sizePreset === 'custom' ?
        <div>

          <TextField
            className={css.customInput}
            onChange={e => setCustomSize(clip(1, parseInt(e.target.value), 10000))}
            onBlur={e => !e.target.value && setCustomSize(10)}
            value={customSize}
            InputProps={{
              inputComponent: MBNumberFormatCustom,
            }}
          />
        </div> :
        null
      }
  </div>);
}


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

