import React, {forwardRef, VideoHTMLAttributes} from "react";

export interface DisplayProps extends VideoHTMLAttributes<HTMLVideoElement> {
  file: string
}

export const Display = forwardRef<HTMLVideoElement, DisplayProps>((props: DisplayProps, ref) => {

  return <video
    ref={ref}
    src={props.file ? 'video://' + props.file : undefined}
    controls={false}
    style={{ width: '100%', height: '100%' }}
  >
    {props.children}
  </video>

});