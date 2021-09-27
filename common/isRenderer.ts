/**
 Copyright Findie 2021
 */

// @ts-ignore
export const isRenderer = (process && process.type === 'renderer');
export const isMain = !isRenderer;
