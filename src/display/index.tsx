import React, {forwardRef, VideoHTMLAttributes} from "react";
import css from './style.css'

export interface DisplayProps extends VideoHTMLAttributes<HTMLVideoElement> {
  file: string
}

export const Display = forwardRef<HTMLVideoElement, DisplayProps>((props: DisplayProps, ref) => {

  const { file, className, ...p } = props;

  return <div className={className}>
    <video className={css.video}
           ref={ref}
           src={props.file ? 'video://' + props.file : ''}
           controls={false}
           {...p}
    >
      {props.children}
    </video>
  </div>;

});