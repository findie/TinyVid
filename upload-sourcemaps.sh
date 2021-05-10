#!/usr/bin/env bash
set -e;

app_version=$(node -e "console.log(require('./package.json').version.replace(/\+/g, '_'))");

sentry-cli releases --org findie-rc -p quicktrim new $app_version

sentry-cli \
  releases --org findie-rc -p quicktrim \
  files $app_version \
  upload-sourcemaps ./ \
  --ext ts --ext tsx --ext map --ext js \
  --ignore node_modules

sentry-cli releases --org findie-rc -p quicktrim finalize $app_version
