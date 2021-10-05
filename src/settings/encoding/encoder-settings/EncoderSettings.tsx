import React from 'react'
import {observer} from "mobx-react";
import {RendererSettings} from "../../../helpers/settings";
import {ProcessorSettingsOptionsTemplate} from "./settings-defs";
import {objKV} from "../../../helpers/js";
import {EncoderSettingInterfaceOptionItem} from "./types";
import {ProcessBaseGenericSettings} from "../../../global-stores/process-codec-stores/ProcessBaseGeneric";
import {MenuItem, Select, Typography} from "@material-ui/core";
import {ProcessStore} from "../../../global-stores/Process.store";
import {action} from "mobx";
import classes from './EncoderSettings.module.scss';

type CommonTypeSettingProps = {
  itemKey: string,
  settings: ProcessBaseGenericSettings<any>,
  item: EncoderSettingInterfaceOptionItem<ProcessBaseGenericSettings<any>, keyof ProcessBaseGenericSettings<any>>
}


const SelectTypeSetting = observer(function SelectTypeSetting({
  itemKey,
  settings,
  item
}: CommonTypeSettingProps) {

  if (item.type !== 'select') {
    console.error(new Error('SelectTypeSetting only support item type select but passed ' + item.type));
    return <pre>bad item type</pre>;
  }

  return (
    <>

      <Select
        className={classes.select}
        key={itemKey}
        value={settings[itemKey as keyof typeof settings]}
        onChange={action(e => {
          // fixme i don't like that i have to ts-ignore here
          //       but i'm out out ideas for now and i have to move on
          // @ts-ignore
          settings[itemKey as keyof typeof processor.settings] = e.target.value;
        })}
        // disableUnderline
        variant="outlined"
      >
        {item.options.map(o => {
          return (
            <MenuItem value={o.value} key={o.value} className={classes.selectItems}>

              <Typography
                variant="h6"
                align="left"
                className={classes.name}
              >
                {o.text}
              </Typography>

              {o.desc && (
                <Typography
                  variant="body2"
                  align="left"
                  className={classes.desc}
                >
                  {o.desc}
                </Typography>
              )}

            </MenuItem>
          )
        })}
      </Select>
    </>
  )
});

const NoneTypeSetting = function NoneTypeSetting(props: CommonTypeSettingProps) {
  return (
    <>
      <Typography variant="h6" style={{ fontStyle: '1.2em' }}>
        Value: {props.settings[props.itemKey as keyof typeof props.settings]}
      </Typography>
      <Typography style={{ opacity: 0.5 }}>
        This value can only be modified from the config file for now.
      </Typography>
    </>
  );
}

export const EncoderSettings = observer(function EncoderSettings() {

  const processorName = RendererSettings.settings.processor;
  const processor = ProcessStore.processor;
  const processorSettingsTemplate = ProcessorSettingsOptionsTemplate[processorName];

  // const items = objValues<EncoderSettingInterfaceOption<typeof Processors[typeof processor]['prototype']['settings']>>(processorSettingsTemplate);
  const items = objKV<{
    [s: string]: EncoderSettingInterfaceOptionItem<ProcessBaseGenericSettings<any>, keyof ProcessBaseGenericSettings<any>>
  }>(processorSettingsTemplate);

  return (
    <div className={classes.root}>
      {items.map(([key, item]) => {

        let component;
        if (item.type === 'select') {
          component = (
            <SelectTypeSetting
              itemKey={key as string}
              settings={processor.settings}
              item={item}
            />
          )
        }
        if (item.type === 'none') {
          component = (
            <NoneTypeSetting
              itemKey={key as string}
              settings={processor.settings}
              item={item}
            />
          )
        }

        if (component) {
          return (
            <div key={key} className={classes.settingRow}>

              <Typography className={classes.settingName} component="div">
                {item.name}

                <Typography className={classes.settingDesc} component="div">
                  {item.desc}
                </Typography>
              </Typography>

              {component}
            </div>
          )
        }

        console.warn('Unknown type', item.type, 'in settings.', 'Cannot render!');
        return null;
      })}
    </div>
  );

});
