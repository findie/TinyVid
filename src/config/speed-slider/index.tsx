import React from "react";
import * as css from './style.css'

import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import {FFHelpers} from "../../../electron/helpers/ff";
import {makeStyles} from "@material-ui/core/styles";
import {Theme} from "../../helpers/theme";
import color from "color";
import {Box, Typography} from "@material-ui/core";

const sliderTheme = makeStyles({
  'root': {
    '& .noUi-connects': {
      background: Theme.current.palette.background.default,
    },

    '& .noUi-connect': {
      background: Theme.current.palette.primary.main,
    },
    '& .noUi-handle': {
      background: color(Theme.current.palette.primary.main).saturate(0.5).toString(),
      boxShadow: 'none'
    },

    '& .noUi-tooltip': {
      background: Theme.current.palette.background.paper,
      color: Theme.current.palette.text.primary,
      ...Theme.current.typography.body1
    }
  },
  'rootDisabled': {
    '& .noUi-connect': {
      background: color(Theme.current.palette.primary.main).desaturate(0.7).toString(),
    },
    '& .noUi-handle': {
      background: color(Theme.current.palette.primary.main).desaturate(0.7).toString(),
    }
  }
});

interface SpeedSliderProps {
  highSpeedText: string
  lowSpeedText: string

  onChange: (speedIndex: number) => void

  className: string

  disabled?: boolean
}

export function SpeedSlider(props: SpeedSliderProps) {
  const classes = sliderTheme();

  return (
    <div
      className={css.container + ' ' + props.className + ' ' + classes.root + ' ' + (props.disabled ? classes.rootDisabled : '')}>
      <Typography>{props.highSpeedText}</Typography>
      <Box marginX={3} className={css.slider}>
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
      <Typography>{props.lowSpeedText}</Typography>
    </div>
  )
}