/**
 Copyright Findie 2021
 */
import {ProcessH264} from "./ProcessH264";
import {ProcessH265} from "./ProcessH265";

export const Processors = {
  libx264: ProcessH264,
  libx265: ProcessH265,
} as const;
