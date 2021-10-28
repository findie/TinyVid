/**
 Copyright Findie 2021
 */
import {computed, makeObservable} from "mobx";
import {between} from "../../helpers/math";
import {ProcessStore} from "../../global-stores/Process.store";
import {AppState} from "../../global-stores/AppState.store";

export type AlertVariants = 'corrupt' | 'bad' | 'artifacts' | 'ok' | 'waste';

class BitrateWarningStoreClass {

  constructor() {
    makeObservable(this);
  }

  @computed get alertType(): AlertVariants {
    const videoDetails = ProcessStore.videoDetails;
    const videoSettings = ProcessStore.videoSettings;

    if (!videoDetails) return 'ok';
    if (ProcessStore.strategyType !== "max-file-size") return 'ok';

    const duration = AppState.trimRange.end - AppState.trimRange.start;
    const fileSizeInBytes = ProcessStore.strategyTune;

    const bitrateThresholds = ProcessStore.processor.optimalBitrateCalculator(videoDetails, videoSettings);
    const averageBitrateInKb = ProcessStore.processor.computeAverageBPS(fileSizeInBytes, duration, ProcessStore.audioSettings.volume > 0);

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
