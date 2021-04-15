/**
 Copyright Findie 2021
 */
import {computed, makeObservable} from "mobx";
import {FFHelpers} from "../../../electron/helpers/ff";
import {between} from "../../helpers/math";
import {ProcessStore} from "../../Process.store";
import {AppState} from "../../AppState.store";

export type AlertVariants = 'corrupt' | 'bad' | 'artifacts' | 'ok' | 'waste';

class BitrateWarningStoreClass {

  constructor() {
    makeObservable(this);
  }

  @computed get alertType(): AlertVariants {
    const videoDetails = ProcessStore.simpleVideoDetails;
    const videoSettings = ProcessStore.videoSettings;

    if (!videoDetails) return 'ok';
    if (ProcessStore.strategyType !== "max-file-size") return 'ok';

    const duration = AppState.trimRange.end - AppState.trimRange.start;
    const fileSizeInBytes = ProcessStore.strategyTune;

    const bitrateThresholds = FFHelpers.optimalBitrateCalculator(videoDetails, videoSettings);
    const averageBitrateInKb = FFHelpers.computeAverageBPS(fileSizeInBytes, duration);

    const averageVideoBitrateInBits = averageBitrateInKb.videoBitrateInKb * 1024;

    // bad quality
    if (between(bitrateThresholds.mayCorrupt[0], averageVideoBitrateInBits, bitrateThresholds.mayCorrupt[1])) {
      return 'corrupt';
    }
    if (between(bitrateThresholds.veryBad[0], averageVideoBitrateInBits, bitrateThresholds.veryBad[1])) {
      return 'bad';
    }
    if (between(bitrateThresholds.blockingArtifacts[0], averageVideoBitrateInBits, bitrateThresholds.blockingArtifacts[1])) {
      return 'artifacts';
    }

    // ok
    if (
      between(bitrateThresholds.good[0], averageVideoBitrateInBits, bitrateThresholds.good[1]) ||
      between(bitrateThresholds.diminishingReturns[0], averageVideoBitrateInBits, bitrateThresholds.diminishingReturns[1])
    ) {
      return 'ok';
    }

    // too big
    if (between(bitrateThresholds.wastedSpace[0], averageVideoBitrateInBits, bitrateThresholds.wastedSpace[1])) {
      return 'waste';
    }

    console.trace('you should not be here');
    return 'ok';
  }
}

export const BitrateWarningStore = new BitrateWarningStoreClass()
