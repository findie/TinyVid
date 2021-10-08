import React, {FormEvent, useEffect, useState} from "react";
import * as css from './style.css';
import {clip} from "../../helpers/math";
import {
  FormControl,
  IconButton,
  InputBaseComponentProps,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip
} from "@material-ui/core";
import NumberFormat from 'react-number-format';
import {observer} from "mobx-react";
import {RendererSettings} from "../../helpers/settings";
import Delete from "@material-ui/icons/Delete";
import Add from "@material-ui/icons/Add";
import {ModalTrigger} from "../../components/modals";
import {TextFieldCard} from "../../components/TextFieldCard";
import {action} from "mobx";
import {useProcess} from "../../global-stores/contexts/Process.context";

export interface ConfigMaxFileSizeProps {
  disabled?: boolean
}

export const ConfigMaxFileSize = observer(function ConfigMaxFileSize(props: ConfigMaxFileSizeProps) {

  const store = useProcess();

  const size = store.strategy.tune;
  const fileSizePresets = RendererSettings.settings.UI.fileSizePresets;
  const sizeIsPreset = fileSizePresets.find(x => x.size === size);

  const [sizeIsCustom, setSizeIsCustom] = useState(false);

  useEffect(() =>{
    if(!sizeIsPreset){
      setSizeIsCustom(true);
    }
  }, [sizeIsPreset, setSizeIsCustom])

  return (
    <div className={css.maxFileSizeConfig}>
      <FormControl disabled={props.disabled}>
        <InputLabel id="size">Size</InputLabel>

        <Select
          onChange={e => {
            if (e.target.value === 'custom') {
              setSizeIsCustom(true);
            } else {
              setSizeIsCustom(false);
              store.setStrategyTune(parseInt(e.target.value as string))
            }
          }}
          value={sizeIsCustom || !sizeIsPreset ? 'custom' : size}
          labelId={'size'}
          className={css.select}
          disabled={props.disabled}
        >
          {fileSizePresets.map(({ size, text }, index) =>
            <MenuItem value={size} key={`${text} ${index} ${size}`} className={css.menuItem}>
              {text}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  action(() => {
                    const [spliced] = fileSizePresets.splice(index, 1);
                    if (spliced.size === size) {
                      setSizeIsCustom(true);
                    }
                  })();
                }}
                disabled={fileSizePresets.length <= 1}
              >
                <Delete/>
              </IconButton>
            </MenuItem>
          )}
          <MenuItem value={'custom'}>Custom</MenuItem>
        </Select>
      </FormControl>

      {sizeIsCustom ?
        <div>

          <TextField
            className={css.customInput}
            onChange={e => store.setStrategyTune(clip(1, parseInt(e.target.value), 10000))}
            onBlur={e => !e.target.value && store.setStrategyTune(10)}
            value={size}
            InputProps={{
              inputComponent: MBNumberFormatCustom,
            }}
            disabled={props.disabled}
          />
          <ModalTrigger
            trigger={(
              <Tooltip title="Add to presets">
                <IconButton size="small" disabled={props.disabled}>
                  <Add/>
                </IconButton>
              </Tooltip>
            )}
          >
            {({ closeModal }) => (
              <TextFieldCard
                allowEmpty
                title="Set preset name"
                placeholder="Add a name or leave empty"
                onCancel={closeModal}
                onSave={action(text => {
                  closeModal();
                  fileSizePresets.push({
                    text: text ? `${size} MB (${text})` : `${size} MB`,
                    size
                  });
                  setSizeIsCustom(false);
                })}
              />
            )}
          </ModalTrigger>

        </div> :
        null
      }
    </div>);
});


interface MBNumberFormatCustomProps extends InputBaseComponentProps {
// noop
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

