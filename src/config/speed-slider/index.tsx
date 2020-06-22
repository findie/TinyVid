import React from "react";
import * as css from './style.css'

import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import {FFHelpers} from "../../../electron/helpers/ff";
import {makeStyles} from "@material-ui/core/styles";
import {Theme} from "../../helpers/theme";
import color from "color";
import {Box, Tooltip, Typography} from "@material-ui/core";

const sliderTheme = () => makeStyles({
  'root': {
    '& .noUi-connects': {
      background: Theme.current().palette.background.default,
    },

    '& .noUi-connect': {
      background: Theme.current().palette.primary.main,
    },
    '& .noUi-handle': {
      background: color(Theme.current().palette.primary.main).saturate(0.5).toString()
    },

    '& .noUi-tooltip': {
      background: Theme.current().palette.background.paper,
      color: Theme.current().palette.text.primary,
      ...Theme.current().typography.body1
    }
  },
  'rootDisabled': {
    '& .noUi-connect': {
      background: Theme.disabledColor(Theme.current().palette.primary.main),
    },
    '& .noUi-handle': {
      background: Theme.disabledColor(Theme.current().palette.primary.main),
    }
  }
});

interface SpeedSliderProps {
  highSpeedText: string
  lowSpeedText: string

  highSpeedTooltip: string
  lowSpeedTooltip: string

  onChange: (speedIndex: number) => void

  className: string

  disabled?: boolean
}

export function SpeedSlider(props: SpeedSliderProps) {
  const classes = sliderTheme()();

  return (
    <div
      className={css.container + ' ' + props.className + ' ' + classes.root + ' ' + (props.disabled ? classes.rootDisabled : '')}>
      <Tooltip title={props.highSpeedTooltip} arrow>
        <Typography>
          {props.highSpeedText}
        </Typography>
      </Tooltip>
      <Box marginX={3} marginY={2} className={css.slider}>
        <Nouislider
          range={{
            min: [0, 1],
            '50%': [5, 1],
            max: FFHelpers.encodingSpeedPresets.length - 1
          }}
          tooltips={true}
          disabled={props.disabled}
          format={{
            to(val: number): string {
              return FFHelpers.encodingSpeedPresetsDisplay[Math.round(val)];
            },
            from(val: FFHelpers.EncodingSpeedPresetsType): number {
              return FFHelpers.encodingSpeedPresetsDisplay.indexOf(val);
            }
          }}
          start={['medium']}
          onUpdate={values => props.onChange(FFHelpers.encodingSpeedPresetsDisplay.indexOf(values[0]))}
        />
      </Box>
      <Tooltip title={props.lowSpeedTooltip} arrow>
        <Typography>
          {props.lowSpeedText}
        </Typography>
      </Tooltip>
    </div>
  )
}