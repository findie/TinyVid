import React, {useContext} from 'react';
import {AudioSettings, RenderStrategy, VideoSettings} from "../../../electron/types";
import {FFprobeData} from "../../../common/ff/ffprobe";

export interface IProcessContext {

  // strategy
  readonly strategy: RenderStrategy

  setStrategyType(type: RenderStrategy['type']): void

  setStrategyTune(tune: RenderStrategy['tune']): void

  // data
  readonly videoDetails: null | FFprobeData;

  // video
  readonly videoSettings: VideoSettings

  setVideoSettings<K extends keyof IProcessContext['videoSettings']>(key: K, val: IProcessContext['videoSettings'][K]): void;

  // audio
  readonly audioSettings: AudioSettings

  setAudioSettings<K extends keyof IProcessContext['audioSettings']>(key: K, val: IProcessContext['audioSettings'][K]): void;


}

const ProcessContext = React.createContext<IProcessContext | null>(null);
export const useProcess = () => {
  const store = useContext(ProcessContext);
  if (!store) {
    throw new Error('Missing ProcessContext')
  }
  return store;
}


type ProcessContextProviderProps = {
  children: React.ReactNode
  store: IProcessContext
};


export function ProcessContextProvider(props: ProcessContextProviderProps) {
  const { children, store } = props;

  return (
    <ProcessContext.Provider value={store}>
      {children}
    </ProcessContext.Provider>
  );
}
