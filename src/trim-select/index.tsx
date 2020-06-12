import React, {useEffect, useState} from "react";
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import * as css from './style.css'

export interface TrimSliderProps {
  duration: number
  onChange: (begin: number, end: number, current: number) => void
  disabled: boolean
}

export const TrimSlider = (props: TrimSliderProps) => {

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
    <Nouislider
      className={css.slider}
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
  );

}