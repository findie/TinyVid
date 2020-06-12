import React from "react";
import * as css from './style.css'

import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import {FFHelpers} from "../../../electron/helpers/ff";


interface SpeedSliderProps {
  highSpeedText: string
  lowSpeedText: string

  onChange: (speedIndex: number) => void

  className: string
}

export function SpeedSlider(props: SpeedSliderProps) {

  return (
    <div className={css.container + ' ' + props.className}>
      <div>{props.highSpeedText}</div>
      <Nouislider
        className={css.slider}
        range={{
          min: [0, 1],
          '50%': [5, 1],
          max: FFHelpers.encodingSpeedPresets.length - 1
        }}
        tooltips={true}
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
      <div>{props.lowSpeedText}</div>
    </div>
  )
}