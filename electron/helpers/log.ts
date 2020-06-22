import log from 'electron-log';

log.transports.file.level = 'info';
Object.assign(console, log.functions);
console.log('~'.repeat(10) + ` ${new Date} ` + '~'.repeat(10));

export const logger = log;