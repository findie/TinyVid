import React from "react";
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import {makeStyles} from "@material-ui/core/styles";
import {Theme} from "../../helpers/theme";
import color from 'color'

export interface TrimSliderProps {
  duration: number
  onChange: (begin: number, end: number, current: number) => void
  disabled: boolean
}

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

export const TrimSlider = (props: TrimSliderProps) => {
  const classes = sliderTheme();

  let start = props.duration * .33;
  let end = props.duration * .66;
  let current = props.duration * .5;

  function update(values: any[], handle: number, unencodedValues: number[], tap: boolean, positions: number[]) {
    const val = unencodedValues[handle];
    current = val;
    start = unencodedValues[0];
    end = unencodedValues[1];

    props.onChange(unencodedValues[0], unencodedValues[1], val);
  }

  return (
    <div className={classes.root + ' ' + (props.disabled ? classes.rootDisabled : '')}>
      <Nouislider
        disabled={props.disabled}
        keyboardSupport
        onSlide={update}
        onSet={update}
        step={1 / 60}
        range={{ min: 0, max: props.duration }}
        start={[props.duration / 3 * 1, props.duration / 3 * 2]}
        connect={[false, true, false]}
        tooltips
        format={{
          from(val: string): number {
            return parseFloat(val.split('-')[0].trim().replace('s', ''));
          },
          to(val: number): string {
            return `${val.toFixed(3)}s - Duration: ${(end - start).toFixed(2)}s`;
          }
        }}

      />
    </div>
  );

}