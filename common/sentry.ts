/**
 Copyright Findie 2021
 */

import * as Sentry from "@sentry/electron";
import {CaptureConsole} from "@sentry/integrations";

Sentry.init({
  dsn: "https://4dd962835ee849558d9726c06957f9cd@o106683.ingest.sentry.io/5703632",
  integrations: [
    // @ts-ignore
    new CaptureConsole({
      levels: ['error']
    })
  ],
  release: require('../package.json').version,
});


export type ErrorLike = {
  message: string
  name: string
  stack: string
}

export function logError(e: Error | ErrorLike) {
  Sentry.captureException(e);
}
