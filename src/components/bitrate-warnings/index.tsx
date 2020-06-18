import React from "react";
import {DetailsComms} from "../../helpers/comms";
import {VideoSettings} from "../../../electron/types";
import {Collapse} from "@material-ui/core";
import {Alert, AlertTitle} from "@material-ui/lab"
import {FFHelpers} from "../../../electron/helpers/ff";
import {between} from "../../helpers/math";

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

  const bitrateThresholds = FFHelpers.optimalBitrateCalculator(props.videoDetails, props.videoSettings);
  const averageBitrateInKb = FFHelpers.computeAverageBPS(props.fileSizeInBytes, props.duration);
  const averageVideoBitrateInBits = averageBitrateInKb.videoBitrateInKb * 1024;
  let alert: React.ReactNode = null;
  let shouldShowAlert = false;

  // console.log('avg bitrate in Kb', averageBitrateInKb.videoBitrateInKb)
  // console.log(bitrateThresholds)
  // console.log('bits per pixel ratio', averageVideoBitrateInBits / (props.videoDetails.width * props.videoDetails.height * props.videoDetails.fps))
  // console.log('~'.repeat(80));

  // bad quality
  if (between(bitrateThresholds.mayCorrupt[0], averageVideoBitrateInBits, bitrateThresholds.mayCorrupt[1])) {
    alert =
      <Alert elevation={6} severity={'error'} variant={'filled'}>
        <AlertTitle>Your video will corrupt!</AlertTitle>
        Reduce video duration, fps, resolution or increase file size.
      </Alert>;

    shouldShowAlert = true;
  }
  if (between(bitrateThresholds.veryBad[0], averageVideoBitrateInBits, bitrateThresholds.veryBad[1])) {
    alert =
      <Alert elevation={6} severity={'warning'} variant={'filled'}>
        <AlertTitle>Video may look blocky!</AlertTitle>
        Depending on how much movement there is, you may have to reduce video duration, fps, resolution or increase file
        size.
      </Alert>;
    shouldShowAlert = true;

  }
  if (between(bitrateThresholds.blockingArtifacts[0], averageVideoBitrateInBits, bitrateThresholds.blockingArtifacts[1])) {
    alert =
      <Alert elevation={6} severity={'warning'} variant={'filled'}>
        <AlertTitle>Some artifacts may occur!</AlertTitle>
        Depending on how much movement there is, you may experience some visual quality loss.
      </Alert>;
    shouldShowAlert = true;

  }

  // ok
  if (
    between(bitrateThresholds.good[0], averageVideoBitrateInBits, bitrateThresholds.good[1]) ||
    between(bitrateThresholds.diminishingReturns[0], averageVideoBitrateInBits, bitrateThresholds.diminishingReturns[1])
  ) {
    alert =
      <Alert elevation={6} severity={'success'} variant={'filled'}>
        <AlertTitle>All looks to be Ok!</AlertTitle>
      </Alert>;
  }

  // too big
  if (between(bitrateThresholds.wastedSpace[0], averageVideoBitrateInBits, bitrateThresholds.wastedSpace[1])) {
    alert =
      <Alert elevation={6} severity={'warning'} variant={'filled'}>
        <AlertTitle>You may be wasting space!</AlertTitle>
        It is possible to lower the file size or increase resolution or fps without losses.
      </Alert>;
    shouldShowAlert = true;

  }

  return (
    <div className={props.className}>
      <Collapse in={shouldShowAlert} timeout={{ exit: 3000 }}>
        {alert}
        <div style={{ height: '100px' }}>
          {/* add some extra height to act as a delay for the collapse to exit */}
        </div>
      </Collapse>
    </div>
  );
}