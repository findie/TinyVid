import {ProcessBaseGenericSettings} from "../../../global-stores/process-codec-stores/ProcessBaseGeneric";

/**
 Copyright Findie 2021
 */

type CommonProps = {
  name: string,
  desc: string,
}

export type EncoderSettingInterfaceOptionSelector<VALUES> = CommonProps & {
  type: 'select',
  options: {
    text: string,
    value: VALUES,
    desc?: string
  }[]
}


export type EncoderSettingInterfaceRange =CommonProps &  {
  type: 'range',
  options: {
    text: string,
    min: number,
    max: number,
    step: number,
    desc?: string
  }[]
}

export type EncoderSettingInterfaceNone =CommonProps &  {
  type: 'none',
}

export type EncoderSettingInterfaceOptionItem<T extends ProcessBaseGenericSettings<any>, K extends keyof T> =
  EncoderSettingInterfaceOptionSelector<T[K]> |
  EncoderSettingInterfaceRange |
  EncoderSettingInterfaceNone;

export type EncoderSettingInterfaceOption<T extends ProcessBaseGenericSettings<any>> = {
  [K in keyof Omit<T, keyof ProcessBaseGenericSettings<any>>]: EncoderSettingInterfaceOptionItem<T, K>
}
