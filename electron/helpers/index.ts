/**
 Copyright Findie 2021
 */

import {initMainEventComms} from './event-comms';

export const isMac = process.platform === 'darwin'

initMainEventComms();
