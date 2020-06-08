import React, {useRef, useState} from 'react';
import ReactDom from 'react-dom';
import {ChooseFile} from "./choose-file";
import {Display} from "./display";
import {TrimSlider} from "./trim-select";
import {Done, Progress} from "./progress";
import {IFFMpegProgressData} from "ffmpeg-progress-wrapper";
import css from './style.css';
import {
  ConfigMaxFileSize,
  ConfigMaxFileSizeDefaultSize,
  ConfigMaxFileSizeDefaultSpeedOrQuality
} from "./config/max-file-size";
import {SpeedSlider} from "./config/speed-slider";
import {FFHelpers} from "../electron/ffhelpers";
import {ConfigConstantQuality} from "./config/constant-quality";
import {ConfigVideoSettings, ConfigVideoSettingsData, ConfigVideoSettingsDefault} from "./config/video-settings";

const mainElement = document.createElement('div');
document.body.appendChild(mainElement);


const defaultMaxFileSizeStrategy: FFHelpers.RenderStrategy = {
  type: 'max-file-size',
  size: ConfigMaxFileSizeDefaultSize,
  speed_or_quality: ConfigMaxFileSizeDefaultSpeedOrQuality
}
const defaultConstantQuality: FFHelpers.RenderStrategy = {
  type: 'constant-quality',
  quality: undefined,
  speed_or_file_size: undefined
}

const App = () => {

  const videoElementRef = useRef<HTMLVideoElement>(null)
  const [file, setFile] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [range, setRange] = useState<{ start: number, end: number }>({ start: 0, end: 0 })

  const [processing, setProcessing] = useState<IFFMpegProgressData | null>(null);
  const [isDone, setDone] = useState(false);

  const [fileOut, setFileOut] = useState<string>();

  const [strategy, setStrategy] = useState<FFHelpers.RenderStrategy>(defaultMaxFileSizeStrategy);
  const [videoSettings, setVideoSettings] = useState<ConfigVideoSettingsData>(ConfigVideoSettingsDefault);

  let checkInterval: NodeJS.Timeout;

  async function checkProgress() {
    const f = await fetch('trim://' + file, {
      method: 'get'
    });
    const json: IFFMpegProgressData = await f.json();

    setProcessing(json);
    if (!json) {
      clearInterval(checkInterval);
      setDone(true);
    }
  }

  async function startProcess() {
    setProcessing({ speed: 0, progress: 0, eta: 0 });
    const fileOut = `${file}.${range.start.toFixed(2)}-${range.end.toFixed(2)}.mp4`
    setFileOut(fileOut);

    const f = await fetch('trim://' + file, {
      method: 'post',
      body: JSON.stringify({
        start: range.start,
        end: range.end,
        out: fileOut,
        strategy: strategy,
        settings: videoSettings
      }),
      headers: { 'content-type': 'application/json' }
    });
    checkInterval = setInterval(checkProgress, 500);
  }

  return (
    <div className={css.app}>
      <div className={css.header}>
        <ChooseFile fileCB={setFile}/>
      </div>
      <Display
        className={css.display}
        file={file}
        ref={videoElementRef}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration)
        }}
      />
      <div className={css.footer}>
        <TrimSlider
          disabled={!file}
          duration={duration || 100}
          onChange={(begin, end, current) => {
            if (videoElementRef.current) {
              videoElementRef.current.currentTime = current;
            }
            setRange({
              start: begin,
              end: end
            });
          }}
        />

        <hr/>

        <div className={css.controls}>
          <div className={css.rows + ' ' + css.flexGrow}>

            <div className={css.settings}>
              <div className={css.left}>
                Output must &nbsp;
                <select
                  onChange={
                    e => e.target.value === 'max-file-size' ?
                      setStrategy(defaultMaxFileSizeStrategy) :
                      setStrategy(defaultConstantQuality)
                  }
                  value={strategy.type}
                >
                  <option value={'max-file-size'}>have max file size of</option>
                  <option value={'constant-quality'}>be of constant quality</option>
                </select>

                {strategy.type === 'max-file-size' ?
                  <ConfigMaxFileSize onChange={size => setStrategy({ ...strategy, size })}/> :
                  <ConfigConstantQuality onChange={quality => setStrategy({ ...strategy, quality })}/>
                }
              </div>
              <div className={css.right}>
                <ConfigVideoSettings onChange={setVideoSettings}/>
              </div>
            </div>
            <hr/>
            <SpeedSlider
              className={css.speedSlider}
              highSpeedText={strategy.type === 'max-file-size' ? 'High Speed' : 'High Speed'}
              lowSpeedText={strategy.type === 'max-file-size' ? 'High Quality' : 'Small File Size'}
              onChange={
                speedIndex => {
                  if (strategy.type === 'max-file-size') {
                    setStrategy({ ...strategy, speed_or_quality: speedIndex })
                  } else if (strategy.type === 'constant-quality') {
                    setStrategy({ ...strategy, speed_or_file_size: speedIndex })
                  }
                }
              }
            />
          </div>

          <button
            className={css.processBtn}
            disabled={!file}
            onClick={startProcess}
          >Process
          </button>
        </div>

      </div>

      {/*<Progress progress={{*/}
      {/*  processing: {*/}
      {/*    speed: 1,*/}
      {/*    eta: 10000,*/}
      {/*    progress: 0.32*/}
      {/*  }*/}
      {/*}}/>*/}

      {/*<Done onOk={console.log} file={'file out'}/>*/}

      {processing ? <Progress progress={processing}/> : null}
      {isDone ? <Done onOk={() => setDone(false)} file={fileOut}/> : null}
    </div>
  )
}

ReactDom.render(<App/>, mainElement);