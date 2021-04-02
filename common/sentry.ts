/**
 Copyright Findie 2021
 */
import * as Sentry from "@sentry/electron";
import {CaptureConsole} from "@sentry/integrations";
import {isProd} from "./isProd";

if (isProd) {
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
}


export type ErrorLike = {
  message: string
  name: string
  stack: string
}

export function logError(e: Error | ErrorLike) {
  Sentry.captureException(e);
}

if (process.type === 'browser') {
  const { crashReporter } = require("electron");
  crashReporter.start({
    companyName: "Kamua",
    productName: "TinyVid",
    ignoreSystemCrashHandler: true,
    submitURL: "https://o106683.ingest.sentry.io/api/5703632/minidump/?sentry_key=4dd962835ee849558d9726c06957f9cd",
  });
}
