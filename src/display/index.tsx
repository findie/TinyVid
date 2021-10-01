import React, {useEffect, VideoHTMLAttributes} from "react";
import css from './style.css'
import {observer} from "mobx-react";
import {AppState} from "../global-stores/AppState.store";
import {PlaybackStore} from "../global-stores/Playback.store";

export interface DisplayProps extends VideoHTMLAttributes<HTMLVideoElement> {
}

export const Display = observer(function Display(props: DisplayProps) {

  const { className, ...p } = props;

  useEffect(() => {
    if (PlaybackStore.videoRef.current) {
      PlaybackStore.videoRef.current.currentTime = AppState.lastTrimValue;
    }
  }, [AppState.lastTrimValue]);

  return <div className={className}>
    <video
      className={css.video}
      ref={PlaybackStore.videoRef}
      src={AppState.file ? 'video://' + encodeURIComponent(AppState.file) : ''}
      controls={false}
      {...p}
    >
    </video>

    {props.children}
  </div>;

});
