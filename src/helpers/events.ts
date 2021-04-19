import {reaction} from "mobx";
import {ProcessStore} from "../Process.store";
import {DetailsComms} from "./comms";
import {AlertVariants, BitrateWarningStore} from "../components/bitrate-warnings/BitrateWarning.store";
import {debounce} from "throttle-debounce";
import {ThemeNames} from "./theme";

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
};

export type EventCategories = keyof typeof categoryList;


function trackEvent(category: EventCategories, data: TrackingEvent) {
    let eventName = data.action;

    const categoryDetails = categoryList[category];

    if (categoryDetails.includeCategory) {
        eventName = `${categoryDetails.title} - ${eventName}`;
    }

    if (window.gtag) {
        window.gtag('event', eventName, {...data.extraParams});
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
