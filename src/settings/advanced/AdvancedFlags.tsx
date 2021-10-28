import React from 'react'
import {observer} from "mobx-react";
import {Checkbox, FormControlLabel, Typography} from "@material-ui/core";
import {RendererSettings} from "../../helpers/settings";
import {action} from "mobx";
import classes from './AdvancedFlags.module.scss';
import classNames from "classnames";

export const AdvancedSettingsFlags = observer(function AdvancedSettingsFlags() {
  return (
    <>
      <Typography variant="h6">Flags</Typography>

      <FormControlLabel
        label="Enable Dev Tools"
        className={classes.formControl}
        control={
          <Checkbox
            color="primary"
            checked={RendererSettings.settings.flags.enableDevTools}
            onChange={action((event, checked) => {
              RendererSettings.settings.flags.enableDevTools = checked;
            })}
          />
        }
      />
      <Typography
        variant="subtitle1"
        className={classNames(classes.subtext, classes.warn)}
      >
        Requires app restart to take effect
      </Typography>

      <FormControlLabel
        label="Compatibility: Disable NvEnc HEVC B-frames"
        className={classes.formControl}
        control={
          <Checkbox
            color="primary"
            checked={RendererSettings.settings.flags.noHevcNvencBFrames}
            onChange={action((event, checked) => {
              RendererSettings.settings.flags.noHevcNvencBFrames = checked;
            })}
          />
        }
      />
      <Typography
        variant="subtitle1"
        className={classes.subtext}
      >
        Older GPUs don't support B-frames. Disable them for compatibility
      </Typography>

    </>
  )
})
