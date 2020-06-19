import log from 'electron-log';

Object.assign(console, log.functions);
console.log('~'.repeat(10) + ` ${new Date} ` + '~'.repeat(10));