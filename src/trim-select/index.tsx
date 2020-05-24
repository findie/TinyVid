import React from "react";
import Nouislider, {Callback as SliderCallback} from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import './style.css'

export interface TrimSliderProps {
  duration: number
  onSlide: SliderCallback
  onSet: SliderCallback
  disabled: boolean
}

export const TrimSlider = (props: TrimSliderProps) => {

  return (
    <Nouislider
      disabled={props.disabled}
      keyboardSupport
      onSlide={props.onSlide}
      onSet={props.onSet}
      range={{ min: 0, max: props.duration }}
      start={[props.duration / 3 * 1, props.duration / 3 * 2]}
      connect={[false, true, false]}
      // pips={{
      //   mode: 'steps',
      //   stepped: true,
      //   density: 4
      // }}
      tooltips
      format={{
        from(val: string): number {
          return parseFloat(val.replace('s', ''));
        },
        to(val: number): string {
          return val.toFixed(3) + 's';
        }
      }}
    />
  );

}