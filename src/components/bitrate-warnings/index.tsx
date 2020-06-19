import React, {useEffect, useState} from "react";
import {DetailsComms} from "../../helpers/comms";
import {VideoSettings} from "../../../electron/types";
import {Collapse} from "@material-ui/core";
import {Alert, AlertProps, AlertTitle} from "@material-ui/lab"
import {FFHelpers} from "../../../electron/helpers/ff";
import {between} from "../../helpers/math";

type AlertVariants = 'corrupt' | 'bad' | 'artifacts' | 'ok' | 'waste';

const alertMessages: ({ [s in AlertVariants]: { title: string, text: string, severity: AlertProps['severity'], type: AlertVariants } }) = {
  corrupt: {
    title: 'Your video will corrupt!',
    text: 'Reduce video duration, fps, resolution or increase file size.',
    severity: "error",
    type: "corrupt"
  },
  bad: {
    title: 'Video may look blocky!',
    text: 'Depending on how much movement there is, you may have to reduce video duration, fps, resolution or increase file size.',
    severity: "warning",
    type: 'bad',
  },
  artifacts: {
    title: 'Some artifacts may occur!',
    text: 'Depending on how much movement there is, you may experience some visual quality loss.',
    severity: 'warning',
    type: "artifacts"
  },
  ok: {
    title: 'All looks to be Ok!',
    text: '',
    severity: 'success',
    type: "ok"
  },
  waste: {
    title: 'You may be wasting space!',
    text: 'It is possible to lower the file size or increase resolution or fps without losses.',
    severity: 'warning',
    type: "waste"
  }
}

function getAlertType(videoDetails: DetailsComms.SimpleVideoDetails, videoSettings: VideoSettings, fileSizeInBytes: number, duration: number) {
  const bitrateThresholds = FFHelpers.optimalBitrateCalculator(videoDetails, videoSettings);
  const averageBitrateInKb = FFHelpers.computeAverageBPS(fileSizeInBytes, duration);

  const averageVideoBitrateInBits = averageBitrateInKb.videoBitrateInKb * 1024;

  // bad quality
  if (between(bitrateThresholds.mayCorrupt[0], averageVideoBitrateInBits, bitrateThresholds.mayCorrupt[1])) {
    return alertMessages.corrupt;
  }
  if (between(bitrateThresholds.veryBad[0], averageVideoBitrateInBits, bitrateThresholds.veryBad[1])) {
    return alertMessages.bad;
  }
  if (between(bitrateThresholds.blockingArtifacts[0], averageVideoBitrateInBits, bitrateThresholds.blockingArtifacts[1])) {
    return alertMessages.artifacts;
  }

  // ok
  if (
    between(bitrateThresholds.good[0], averageVideoBitrateInBits, bitrateThresholds.good[1]) ||
    between(bitrateThresholds.diminishingReturns[0], averageVideoBitrateInBits, bitrateThresholds.diminishingReturns[1])
  ) {
    return alertMessages.ok;
  }

  // too big
  if (between(bitrateThresholds.wastedSpace[0], averageVideoBitrateInBits, bitrateThresholds.wastedSpace[1])) {
    return alertMessages.waste;
  }

  console.trace('you should not be here');
  return alertMessages.ok;
}

export interface BitrateWarningsProps {
  videoDetails: DetailsComms.SimpleVideoDetails | null,
  videoSettings: VideoSettings
  duration: number
  fileSizeInBytes: number
  className?: string
}

export function BitrateWarnings(props: BitrateWarningsProps) {

  if (!props.videoDetails) {
    return null;
  }

  const [suppress, setSuppress] = useState(false);
  const [lastAlert, setLastAlert] = useState<AlertVariants>("ok");
  const alertData = getAlertType(props.videoDetails, props.videoSettings, props.fileSizeInBytes, props.duration);

  function temp_close_alert() {
    console.log('should suppress alert')
    setSuppress(true);
  }

  useEffect(() => {

    if (lastAlert !== alertData.type) {
      setLastAlert(alertData.type);
      setSuppress(false);
    }

  }, [props])

  if (suppress) {
    return null;
  }

  return (
    <div className={props.className}>
      <Collapse in={alertData.type !== 'ok'} timeout={{ exit: 3000 }}>
        <Alert elevation={6} severity={alertData.severity} variant={'standard'} onClose={temp_close_alert}>
          <AlertTitle>{alertData.title}</AlertTitle>
          {alertData.text}
        </Alert>
        <div style={{ height: '100px' }}>
          {/* add some extra height to act as a delay for the collapse to exit */}
        </div>
      </Collapse>
    </div>
  );
}