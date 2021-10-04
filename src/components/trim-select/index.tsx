import React, {useState} from "react";
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import {makeStyles} from "@material-ui/core/styles";
import {Theme} from "../../helpers/theme";
import color from 'color'
import * as css from './style.css';
import './style.css'
import {arrIsConsistent, seconds2time} from "../../helpers/math";
import {Box, Icon} from "@material-ui/core"
import {observer} from "mobx-react";
import {AppState} from "../../global-stores/AppState.store";
import {ProcessStore} from "../../global-stores/Process.store";
import classNames from "classnames";
import {PlaybackStore} from "../../global-stores/Playback.store";
import PlayArrow from "@material-ui/icons/PlayArrow";
import {eventList} from "../../helpers/events";

export interface TrimSliderProps {
}

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
  },
  'wiper': {
    background: theme.palette.primary.main,
    color: theme.palette.primary.main,
  },
  'time': {
    ...theme.typography.body1,

    background: theme.palette.primary.main,
    color: theme.palette.getContrastText(theme.palette.primary.main)
  },
}));

export const TrimSlider = observer(function TrimSlider(props: TrimSliderProps) {
  const classes = sliderTheme();

  const disabled = !AppState.file;
  const duration = ProcessStore.videoDetails ?
    ProcessStore.videoDetails.duration || 0.04 :
    100;
  const step = ProcessStore.videoDetails ? 1 / ProcessStore.videoDetails.fps : 0;

  let start = duration * .33;
  let end = duration * .66;
  let current = duration * .5;

  let lastUpdates: number[] = [];
  let to_detect_drag: number | null = null;

  const [startDrag, setStartDrag] = useState<number | null>(null);
  const [startDragTime, setStartDragTime] = useState<number>(0);

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
      AppState.setLastTrimValue(val);
    } else {
      // it's a connect drag, just update head (first slider)
      // console.log('dragging connect', 0, unencodedValues[0]);
      AppState.setLastTrimValue(unencodedValues[0]);
    }

    AppState.setTrimRangeComponent('start', unencodedValues[0]);
    AppState.setTrimRangeComponent('end', unencodedValues[1]);

    if (!to_detect_drag) {
      to_detect_drag = setTimeout(() => {

        lastUpdates = [];
        to_detect_drag = null;

      }, 0);
    }
  }

  return (
    <div
      className={classNames(classes.root, css.root, disabled && classes.rootDisabled)}
    >

      <Nouislider
        className={css.slider}
        disabled={disabled}
        keyboardSupport
        onSlide={update}
        onSet={update}
        step={isNaN(step) || !isFinite(step) ? 0 : step}
        range={{ min: 0, max: duration || 0.04 }}
        start={[0, duration || 0.04]}
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

      {!!ProcessStore.videoDetails?.duration && (
        <div
          className={classNames(css.wiper, classes.wiper, startDrag !== null && css.drag)}
          onMouseDown={(e) => {
            PlaybackStore.pause();
            setStartDrag(e.clientX);
            setStartDragTime(PlaybackStore.currentVideoTimestamp);
            eventList.preview.dragPlayhead();
          }}
          onMouseUp={(e) => setStartDrag(null)}
          onMouseOut={(e) => setStartDrag(null)}

          onMouseMove={e => {
            if (startDrag === null) return;
            const diff = e.clientX - startDrag;

            const track = e.currentTarget.parentElement;
            const trackLen = track!.offsetWidth

            const percentageOfTrackMoved = diff / trackLen;

            PlaybackStore.setTime(startDragTime + percentageOfTrackMoved * ProcessStore.videoDetails!.duration)
          }}
          style={{ left: `${PlaybackStore.currentVideoTimestamp / ProcessStore.videoDetails.duration * 100}%` }}
        >
          <Icon><PlayArrow className={css.icon} color="inherit"/></Icon>
          <div className={classNames(css.time, classes.time)}>{seconds2time(PlaybackStore.currentVideoTimestamp)}</div>
          <div className={css.handle}/>
        </div>
      )}
    </div>
  );

});
