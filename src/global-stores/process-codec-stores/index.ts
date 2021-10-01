/**
 Copyright Findie 2021
 */
import {ProcessBaseGeneric} from "./ProcessBaseGeneric";
import {ProcessH264} from "./ProcessH264";

export const Processors = {
  // 'generic': ProcessBaseGeneric,
  'h264': ProcessH264
} as const;
