import React, {useState} from "react";
import * as css from './style.css'

import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import {makeStyles} from "@material-ui/core/styles";
import {Theme} from "../../helpers/theme";
import color from "color";
import {Box, Tooltip, Typography} from "@material-ui/core";
import {ProcessStore} from "../../global-stores/Process.store";

const sliderTheme = makeStyles(theme => ({
  'root': {
    '& .noUi-connects': {
      background: theme.palette.background.default,
    },

    '& .noUi-connect': {
      background: theme.palette.primary.main,
    },
    '& .noUi-handle': {
      background: color(theme.palette.primary.main).saturate(0.5).toString()
    },

    '& .noUi-tooltip': {
      background: theme.palette.background.paper,
      color: theme.palette.text.primary,
      ...theme.typography.body1
    }
  },
  'rootDisabled': {
    '& .noUi-connect': {
      background: Theme.disabledColor(theme.palette.primary.main),
    },
    '& .noUi-handle': {
      background: Theme.disabledColor(theme.palette.primary.main),
    }
  }
}));

interface SpeedSliderProps {
  initialValue: number

  highSpeedText: string
  lowSpeedText: string

  highSpeedTooltip: string
  lowSpeedTooltip: string

  onChange: (speedIndex: number) => void

  className: string

  disabled?: boolean
}

//
// function wrapPresetNameInBenchmarks(preset: FFHelpers.EncodingSpeedPresetsType): string {
//   const { medium } = FFHelpers.benchmarksH264;
//   const target = FFHelpers.benchmarksH264[preset];
//
//   const targetIndex = FFHelpers.encodingSpeedPresets.findIndex(x => x === preset);
//   const mediumIndex = FFHelpers.encodingSpeedPresets.findIndex(x => x === 'medium');
//
//   const presetName = FFHelpers.encodingSpeedPresetsDisplay[targetIndex];
//
//   if (targetIndex > mediumIndex) {
//     return `<strong>${presetName}</strong>\n${Math.round((1 - target.fps / medium.fps) * 100)}% slower than medium\n${Math.round((1 - target.kbit / medium.kbit) * 100)}% better than medium`
//   }
//   if (targetIndex < mediumIndex) {
//     return `<strong>${presetName}</strong>\n${Math.round((target.fps / medium.fps - 1) * 100)}% faster than medium\n${Math.round((1 - medium.kbit / target.kbit) * 100)}% worse than medium`
//   }
//
//   return `<strong>${presetName}</strong>`;
// }

export function SpeedSlider(props: SpeedSliderProps) {
  const classes = sliderTheme();

  return  null;
  // todo convert this component to use stores too

  // const [initialStart] = useState(FFHelpers.encodingSpeedPresets[Math.round(ProcessStore.strategySpeed)]);
  //
  // return (
  //   <div
  //     className={css.container + ' ' + props.className + ' ' + classes.root + ' ' + (props.disabled ? classes.rootDisabled : '')}>
  //     <Tooltip title={props.highSpeedTooltip} arrow>
  //       <Typography>
  //         {props.highSpeedText}
  //       </Typography>
  //     </Tooltip>
  //     <Box marginX={3} marginY={2} className={css.slider}>
  //       <Nouislider
  //         range={{
  //           min: [0, 1],
  //           '50%': [2, 1],
  //           max: FFHelpers.encodingSpeedPresets.length - 1
  //         }}
  //         step={1}
  //         tooltips={true}
  //         disabled={props.disabled}
  //         format={{
  //           to(val: number): string {
  //             return wrapPresetNameInBenchmarks(FFHelpers.encodingSpeedPresets[Math.round(val)]);
  //           },
  //           from(val: FFHelpers.EncodingSpeedPresetsType): number {
  //             return FFHelpers.encodingSpeedPresets.findIndex(x => val.indexOf(x) === 0);
  //           }
  //         }}
  //         start={[initialStart]}
  //         onUpdate={(values, handler, unencodedValues) => {
  //           props.onChange(Math.round(unencodedValues[0]))
  //         }}
  //       />
  //     </Box>
  //     <Tooltip title={props.lowSpeedTooltip} arrow>
  //       <Typography>
  //         {props.lowSpeedText}
  //       </Typography>
  //     </Tooltip>
  //   </div>
  // )
}
