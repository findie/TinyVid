import React from "react";
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import {makeStyles} from "@material-ui/core/styles";
import {Theme} from "../../helpers/theme";
import color from 'color'
import * as css from './style.css';
import './style.css'
import {arrIsConsistent} from "../../helpers/math";
import {Box} from "@material-ui/core"

export interface TrimSliderProps {
  duration: number
  onChange: (begin: number, end: number, current: number) => void
  disabled: boolean
  step: number
}

const sliderTheme = () => makeStyles({
  'root': {
    '& .noUi-connects': {
      background: Theme.current().palette.background.default,
    },

    '& .noUi-connect': {
      background: Theme.current().palette.primary.main,
    },
    '& .noUi-handle': {
      background: color(Theme.current().palette.primary.main).saturate(0.5).toString(),
      boxShadow: 'none'
    },

    '& .noUi-tooltip': {
      background: Theme.current().palette.background.paper,
      color: Theme.current().palette.text.primary,
      ...Theme.current().typography.body1
    }
  },
  'rootDisabled': {
    '& .noUi-connect': {
      background: color(Theme.current().palette.primary.main).desaturate(0.7).toString(),
    },
    '& .noUi-handle': {
      background: color(Theme.current().palette.primary.main).desaturate(0.7).toString(),
    }
  }
});

export const TrimSlider = (props: TrimSliderProps) => {
  const classes = sliderTheme()();

  let start = props.duration * .33;
  let end = props.duration * .66;
  let current = props.duration * .5;

  let lastUpdates: number[] = [];
  let to_detect_drag: NodeJS.Timeout | null = null;

  function update(values: any[], handle: number, unencodedValues: number[], tap: boolean, positions: number[]) {

    const val = unencodedValues[handle];
    current = val;
    start = unencodedValues[0];
    end = unencodedValues[1];

    // ~~~~ CONNECT DRAG DETECTION ~~~~~
    // if we have a mixed bag of handles
    // aka we've dragged the entire region
    // fire onChange for 1st region
    // this is a hacky and inefficient way to detect if the connect was dragged instead of the head

    lastUpdates.push(handle);

    if (arrIsConsistent(lastUpdates)) {
      // console.log('dragging head', unencodedValues.findIndex(x => x === val), val);
      // it's a slider drag
      props.onChange(unencodedValues[0], unencodedValues[1], val);
    } else {
      // it's a connect drag, just update head (first slider)
      console.log('dragging connect', 0, unencodedValues[0]);
      props.onChange(unencodedValues[0], unencodedValues[1], unencodedValues[0]);
    }

    if (!to_detect_drag) {
      to_detect_drag = setTimeout(() => {

        lastUpdates = [];
        to_detect_drag = null;

      }, 0);
    }
  }

  return (
    <Box marginY={2} marginX={2} className={classes.root + ' ' + (props.disabled ? classes.rootDisabled : '')}>
      <Nouislider
        className={css.slider}
        disabled={props.disabled}
        keyboardSupport
        onSlide={update}
        onSet={update}
        step={props.step}
        range={{ min: 0, max: props.duration }}
        start={[props.duration / 3 * 1, props.duration / 3 * 2]}
        connect={[false, true, false]}
        format={{
          from(val: string): number {
            return parseFloat(val.split('-')[0].trim().replace('s', ''));
          },
          to(val: number): string {
            return `${val.toFixed(3)}s - Duration: ${(end - start).toFixed(2)}s`;
          }
        }}
        behaviour={'drag'}
        // behaviour={'drag-snap'}
      />
    </Box>
  );

}