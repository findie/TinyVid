import type {H264EncodingSpeedPresetsType} from "../../../global-stores/process-codec-stores/ProcessH264";
import {EncoderSettingInterfaceOption, EncoderSettingInterfaceOptionSelector} from "./types";
import {Processors} from "../../../global-stores/process-codec-stores";
import {ProcessH265} from "../../../global-stores/process-codec-stores/ProcessH265";

/**
 Copyright Findie 2021
 */
const benchmarksH264: { fps: number, kbit: number, preset: H264EncodingSpeedPresetsType } [] = [
  {
    preset: 'veryslow',
    fps: 19,
    kbit: 2970
  },
  {
    preset: 'slower',
    fps: 33,
    kbit: 3185,
  },
  {
    preset: 'slow',
    fps: 61,
    kbit: 3200
  },
  {
    preset: 'medium',
    fps: 87,
    kbit: 3271
  },
  {
    preset: 'fast',
    fps: 95,
    kbit: 3379
  },
  {
    preset: 'faster',
    fps: 101,
    kbit: 3600//3226// ????
  },
  {
    preset: 'veryfast',
    fps: 114,
    kbit: 4000,//2816// ????
  },
  {
    preset: 'superfast',
    fps: 115,
    kbit: 5050
  },
  {
    preset: 'ultrafast',
    fps: 123,
    kbit: 7666
  }
];

function presetDesc(preset: H264EncodingSpeedPresetsType): string {
  const mediumIndex = benchmarksH264.findIndex(x => x.preset === 'medium');
  const targetIndex = benchmarksH264.findIndex(x => x.preset === preset);

  const medium = benchmarksH264[mediumIndex];
  const target = benchmarksH264[targetIndex];

  if (targetIndex < mediumIndex) {
    return `${Math.round((1 - target.fps / medium.fps) * 100)}% slower encoding than medium\n${Math.round((1 - target.kbit / medium.kbit) * 100)}% better quality/size than medium`
  }
  if (targetIndex > mediumIndex) {
    return `${Math.round((target.fps / medium.fps - 1) * 100)}% faster encoding than medium\n${Math.round((1 - medium.kbit / target.kbit) * 100)}% worse quality/size than medium`
  }

  return `Most common and usually the best choice`;
}

export const ProcessorSettingsOptionsTemplate: {
  [k in keyof typeof Processors]: EncoderSettingInterfaceOption<typeof Processors[k]['prototype']['settings']>
} = {
  libx264: {
    preset: {
      name: 'Preset',
      desc: 'Control the tradeoff between quality/file size and speed',
      type: 'select',
      options: [{
        text: 'Ultra Fast',
        value: 'ultrafast',
        desc: presetDesc('ultrafast')
      }, {
        text: 'Super Fast',
        value: 'superfast',
        desc: presetDesc('superfast')
      }, {
        text: 'Very Fast',
        value: 'veryfast',
        desc: presetDesc('veryfast')
      }, {
        text: 'Faster',
        value: 'faster',
        desc: presetDesc('faster')
      }, {
        text: 'Fast',
        value: 'fast',
        desc: presetDesc('fast')
      }, {
        text: 'Medium',
        value: 'medium',
        desc: presetDesc('medium')
      }, {
        text: 'Slow',
        value: 'slow',
        desc: presetDesc('slow')
      }, {
        text: 'Slower',
        value: 'slower',
        desc: presetDesc('slower')
      }, {
        text: 'Very Slow',
        value: 'veryslow',
        desc: presetDesc('veryslow')
      }]
    },
    tune: {
      name: 'Tuning',
      desc: 'Tune encoder for your input',
      type: 'select',
      options: [{
        text: 'None',
        value: 'none',
        desc: 'No specific tuning for the content',
      }, {
        text: 'Film',
        value: 'film',
        desc: 'Use for high quality movie content\nLowers deblocking',
      }, {
        text: 'Animation',
        value: 'animation',
        desc: 'Good for cartoons\nUses higher deblocking and more reference frames',
      }, {
        text: 'Grain',
        value: 'grain',
        desc: 'Preserves the grain structure in old, grainy film material',
      }, {
        text: 'Still Images',
        value: 'stillimage',
        desc: 'Good for slideshow-like content',
      }]
    }
  },
  libx265: {
    preset: {
      name: 'Preset',
      desc: 'Control the tradeoff between quality/file size and speed',
      type: 'select',
      options: [
        // populated later in the file
      ]
    },
    tune: {
      name: 'Tuning',
      desc: 'Tune encoder for your input',
      type: 'select',
      options: [{
        text: 'None',
        value: 'none',
        desc: 'No specific tuning for the content',
      }, {
        text: 'Animation',
        value: 'animation',
        desc: 'Good for cartoons\nUses higher deblocking and more reference frames',
      }, {
        text: 'Grain',
        value: 'grain',
        desc: 'Preserves the grain structure in old, grainy film material',
      }]
    }
  },
  "libaom-av1": {
    tiles: { name: 'Tiles', desc: 'Control how the frame is split for processing', type: 'none', },
    // https://www.streamingmedia.com/Articles/ReadArticle.aspx?ArticleID=130284
    cpuUsed: { name: 'Quality/Speed', desc: 'Control the quality/speed ratio', type: 'none', },
  },
  h264_nvenc: {
    // https://developer.nvidia.com/blog/introducing-video-codec-sdk-10-presets/
    preset: {
      name: 'Preset',
      desc: 'Control the tradeoff between quality/file size and speed',
      type: 'select',
      options: [{
        text: 'Fast',
        value: 'fast',
        desc: ''
      }, {
        text: 'Medium',
        value: 'medium',
        desc: `Most common and usually the best choice`
      }, {
        text: 'Blu-ray Compatible',
        value: 'bd',
        desc: `Experimental`
      }]
    }
  },
  hevc_nvenc: {
    preset: {
      name: '',
      desc: '',
      type: 'select',
      options: [
        // populated later in the file
      ]
    }
  }
};

type x = typeof ProcessorSettingsOptionsTemplate.libx264.preset.type

// copy h264 presets to h265
ProcessorSettingsOptionsTemplate.libx265.preset.name = ProcessorSettingsOptionsTemplate.libx264.preset.name;
ProcessorSettingsOptionsTemplate.libx265.preset.desc = ProcessorSettingsOptionsTemplate.libx264.preset.desc;
ProcessorSettingsOptionsTemplate.libx265.preset.type = ProcessorSettingsOptionsTemplate.libx264.preset.type;
if (ProcessorSettingsOptionsTemplate.libx264.preset.type === 'select') {
  (ProcessorSettingsOptionsTemplate.libx265.preset as EncoderSettingInterfaceOptionSelector<typeof ProcessH265['prototype']['settings']['preset']>)
    .options = ProcessorSettingsOptionsTemplate.libx264.preset.options.map(x => ({
    text: x.text,
    value: x.value,
    desc: x.value === 'medium' ?
      'Most common and usually the best choice' :
      x.value === 'ultrafast' ?
        'Fastest encoding speed but worst quality / file size' :
        x.value === 'veryslow' ?
          'Slowest encoding speed but best quality / file size (diminishing returns)' :
          '',
  }));
}

// copy h264_nvenc presets to hevc_nvnec
ProcessorSettingsOptionsTemplate.hevc_nvenc.preset = ProcessorSettingsOptionsTemplate.h264_nvenc.preset;
