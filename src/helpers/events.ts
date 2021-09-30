import {reaction} from "mobx";
import {ProcessStore} from "../Process.store";
import {DetailsComms} from "./comms";
import {AlertVariants, BitrateWarningStore} from "../components/bitrate-warnings/BitrateWarning.store";
import {debounce} from "throttle-debounce";
import {ThemeNames} from "./theme";
import mixpanel from 'mixpanel-browser';
import {RendererSettings} from "./settings";
import {isProd} from "../../common/isProd";

const { version }: { version: string } = require('../../package.json');

if (isProd) {
  mixpanel.init(
    "b621e6cd8fa327206ceee9ecd52e0916",
    { "api_host": "https://api-eu.mixpanel.com" },
    "",
  );

  mixpanel.identify(RendererSettings.settings.ID);
}

type TrackingEvent = {
  action: string,
  label?: string,
  value?: number,
  extraParams?: object,
};


export const categoryList = {
  global: {
    title: 'Global',
    includeCategory: false,
  },
  file: {
    title: 'Files',
    includeCategory: true,
  },
  preview: {
    title: 'Preview',
    includeCategory: true,
  },
  audio: {
    title: 'Audio',
    includeCategory: true
  }
};

export type EventCategories = keyof typeof categoryList;


function trackEvent(category: EventCategories, data: TrackingEvent) {
  let eventName = data.action;

  const categoryDetails = categoryList[category];

  if (categoryDetails.includeCategory) {
    eventName = `${categoryDetails.title} - ${eventName}`;
  }

  console.log('Mixpanel track', eventName, data.extraParams);
  if (isProd) {
    mixpanel.track(eventName, {
      ...data.extraParams
    });
  }
}

function enclose<T extends object = never>(
  category: EventCategories,
  data: TrackingEvent,
) {
  return (
    ...extraParams: T extends never ? [undefined?] : [T]
  ) => trackEvent(category, {
    ...data,
    extraParams: extraParams[0],
  });
}

export const eventList = {
  global: {
    process: enclose<{
      type: string,
      tune: number,
      resolution: number,
      isResolutionChanged: boolean,
      fps: number,
      isFPSChanged: boolean,
      processSpeed: string,
      volume: number,
    }>('global', {
      action: 'Process',
    }),
    sendFeedback: enclose('global', {
      action: 'Send Feedback',
    }),
    viewChanges: enclose('global', {
      action: 'View Changelog',
    }),
    switchTheme: enclose<{
      type: ThemeNames,
    }>('global', {
      action: 'Switch Theme',
    }),
    qualityAlert: enclose<{
      type: AlertVariants,
    }>('global', {
      action: 'Show Quality Alert',
    }),
    openedApp: enclose<{ version: string }>('global', {
      action: 'Opened App',
    }),
  },
  preview: {
    play: enclose('preview', {
      action: 'Play',
    }),
    pause: enclose('preview', {
      action: 'Pause',
    }),
    dragPlayhead: enclose('preview', {
      action: 'Drag Playhead',
    }),
  },
  audio: {
    mute: enclose('audio', {
      action: 'Mute Audio'
    }),
    unmute: enclose('audio', {
      action: 'Unmute Audio'
    }),
    volume: debounce(1000, false, enclose<{ volume: number }>('audio', {
      action: 'Set Volume'
    }))
  },
  file: {
    choose: enclose<{
      type: 'click' | 'dnd'
    }>('file', {
      action: 'Choose File'
    }),
    details: enclose<Omit<DetailsComms.SimpleVideoDetails, 'containerFormats'>
      & { containerFormats: string }>('file', {
      action: 'Details after Open',
    }),
  },
}

declare global {
  interface Window {
    gtag: any,
  }
}

// Reactions to send events when things change within the App.
reaction(() => ProcessStore.simpleVideoDetails, data => {
  if (!data) return;

  console.log('Got Details', data);
  eventList.file.details({
    ...data,
    containerFormats: data.containerFormats.join(', '),
  });
});

reaction(
  () => BitrateWarningStore.alertType,
  debounce(500, false, currentData => {
    eventList.global.qualityAlert({ type: currentData });
  })
);

// runs only once, at init.
eventList.global.openedApp({ version });
