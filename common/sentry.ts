/**
 Copyright Findie 2021
 */

import * as Sentry from "@sentry/electron";

Sentry.init({ dsn: "https://4dd962835ee849558d9726c06957f9cd@o106683.ingest.sentry.io/5703632" });


export type ErrorLike = {
  message: string
  name: string
  stack: string
}

export function logError(e: Error | ErrorLike) {
  Sentry.captureException(e);
}
