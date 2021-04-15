import React, {useEffect, useRef, VideoHTMLAttributes} from "react";
import css from './style.css'
import {observer} from "mobx-react";
import {AppState} from "../AppState.store";

export interface DisplayProps extends VideoHTMLAttributes<HTMLVideoElement> {
  file: string
}

export const Display = observer(function Display(props: DisplayProps) {

  const { file, className, ...p } = props;

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = AppState.lastTrimValue;
    }
  }, [AppState.lastTrimValue]);

  return <div className={className}>
    <video className={css.video}
           ref={videoRef}
           src={props.file ? 'video://' + encodeURIComponent(props.file) : ''}
           controls={false}
           {...p}
    >
    </video>

    {props.children}
  </div>;

});
