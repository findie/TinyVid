/**
 Copyright Findie 2021
 */
import {ProcessH264} from "./ProcessH264";
import {ProcessH265} from "./ProcessH265";
import {ProcessAV1} from "./ProcessAV1";
import {ProcessH264NVENC} from "./ProcessH264NVENC";
import {ProcessHEVCNVENC} from "./ProcessHEVCNVENC";

export const Processors = {
  libx264: ProcessH264,
  libx265: ProcessH265,
  'libaom-av1': ProcessAV1,
  'h264_nvenc': ProcessH264NVENC,
  'hevc_nvenc': ProcessHEVCNVENC
} as const;
