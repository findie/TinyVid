import './types'
import React, {useCallback, useRef, useState} from 'react';
import ReactDom from 'react-dom';
import {ChooseFile} from "./choose-file";
import {Display} from "./display";
import {TrimSlider} from "./trim-select";
import {ProcessingOverlay} from "./progress";
import css from './style.css';
import {
  ConfigMaxFileSize,
  ConfigMaxFileSizeDefaultSize,
  ConfigMaxFileSizeDefaultSpeedOrQuality
} from "./config/max-file-size";
import {SpeedSlider} from "./config/speed-slider";
import {
  ConfigConstantQuality,
  ConfigConstantQualityDefaultQuality,
  ConfigConstantQualityDefaultSpeedOrQuality
} from "./config/constant-quality";
import {ConfigVideoSettings, ConfigVideoSettingsData, ConfigVideoSettingsDefault} from "./config/video-settings";
import {RenderStrategy} from "../electron/types";
import {TrimComms} from "./helpers/comms";

const mainElement = document.createElement('div');
document.body.appendChild(mainElement);


const defaultMaxFileSizeStrategy: RenderStrategy = {
  type: 'max-file-size',
  tune: ConfigMaxFileSizeDefaultSize,
  speed: ConfigMaxFileSizeDefaultSpeedOrQuality
}
const defaultConstantQuality: RenderStrategy = {
  type: 'constant-quality',
  tune: ConfigConstantQualityDefaultQuality,
  speed: ConfigConstantQualityDefaultSpeedOrQuality
}

const App = () => {

  const videoElementRef = useRef<HTMLVideoElement>(null)
  const [file, setFile] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [range, setRange] = useState<{ start: number, end: number }>({ start: 0, end: 0 })

  const [fileOut, setFileOut] = useState<string>();

  const [strategy, setStrategy] = useState<RenderStrategy>({ ...defaultMaxFileSizeStrategy });
  const strategyRef = useRef(strategy);

  const [videoSettings, setVideoSettings] = useState<ConfigVideoSettingsData>(ConfigVideoSettingsDefault);

  const [processingID, setProcessingID] = useState<string | null>(null);

  async function startProcessing() {
    const fout = `${file}.${range.start.toFixed(2)}-${range.end.toFixed(2)}.mp4`

    const data = await TrimComms.startProcess(
      file,
      fout,
      range,
      strategy,
      videoSettings
    );

    setFileOut(fout);
    setProcessingID(data.id);
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
                    e => {
                      if (e.target.value === 'max-file-size') {
                        setStrategy({ ...defaultMaxFileSizeStrategy });
                      } else {
                        setStrategy({ ...defaultConstantQuality });
                      }
                    }
                  }
                  value={strategy.type}
                >
                  <option value={'max-file-size'}>have max file size of</option>
                  <option value={'constant-quality'}>be of constant quality</option>
                </select>

                {strategy.type === 'max-file-size' ?
                  <ConfigMaxFileSize onChange={size => {
                    setStrategy({ ...strategy, tune: size })
                  }}/> :
                  <ConfigConstantQuality onChange={quality => {
                    setStrategy({ ...strategy, tune: quality })
                  }}/>
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
                useCallback(
                  speedIndex => {
                    if (strategy.type === 'max-file-size') {
                      setStrategy({ ...strategy, speed: speedIndex })
                    } else if (strategy.type === 'constant-quality') {
                      setStrategy({ ...strategy, speed: speedIndex })
                    }
                  },
                  [strategy, strategy.type, setStrategy]
                )
              }
            />
          </div>

          <button
            className={css.processBtn}
            disabled={!file}
            onClick={startProcessing}
          >Process
          </button>
        </div>

      </div>

      {processingID ?
        <ProcessingOverlay
          fileIn={file}
          fileOut={fileOut || ''}
          id={processingID}
          onDone={() => setProcessingID(null)}
        /> :
        null
      }
    </div>
  )
}

ReactDom.render(<App/>, mainElement);