import log from 'electron-log';

log.transports.file.level = 'info';
log.transports.file.depth = 10;
log.transports.file.inspectOptions = {
  depth: 10,
  colors: false,
  breakLength: 300,
  showHidden: true
};

Object.assign(console, log.functions);
console.log('~'.repeat(10) + ` ${new Date} ` + '~'.repeat(10));

export const readAllLogs = log.transports.file.readAllLogs
export const logger = log;
