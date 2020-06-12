import './types'
import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import {DetailsComms, TrimComms} from "./helpers/comms";

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
  const [videoDetails, setVideoDetails] = useState<null | DetailsComms.SimpleVideoDetails>(null);
  const [range, setRange] = useState<{ start: number, end: number }>({ start: 0, end: 0 })

  const [fileOut, setFileOut] = useState<string>();

  const [strategyType, setStrategyType] = useState<RenderStrategy['type']>(defaultMaxFileSizeStrategy.type);
  const [strategyTune, setStrategyTune] = useState<RenderStrategy['tune']>(defaultMaxFileSizeStrategy.tune);
  const [strategySpeed, setStrategySpeed] = useState<RenderStrategy['speed']>(defaultMaxFileSizeStrategy.speed);

  const [videoSettings, setVideoSettings] = useState<ConfigVideoSettingsData>(ConfigVideoSettingsDefault);

  const [processingID, setProcessingID] = useState<string | null>(null);

  async function startProcessing() {
    if (!file) return console.warn('refusing to start process with empty video field');

    const fout = `${file}.${range.start.toFixed(2)}-${range.end.toFixed(2)}.mp4`

    const data = await TrimComms.startProcess(
      file,
      fout,
      range,
      { type: strategyType, tune: strategyTune, speed: strategySpeed },
      videoSettings
    );

    setFileOut(fout);
    setProcessingID(data.id);
  }

  useEffect(function getVideoDetails() {
    if (!file) return console.warn('refusing to start process with empty video field');

    setVideoDetails(null);

    DetailsComms.getDetails(file)
      .then(details => {
        setVideoDetails(DetailsComms.simplifyMediaDetails(details));
        console.log(details);
      })
      .catch(console.error);

  }, [file]);

  return (
    <div className={css.app}>
      <div className={css.header}>
        <ChooseFile fileCB={setFile}/>
      </div>
      <Display
        className={css.display}
        file={file}
        ref={videoElementRef}
      />
      <div className={css.footer}>
        <TrimSlider
          disabled={!file}
          duration={videoDetails ? videoDetails.duration : 100}
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
                        setStrategyType('max-file-size');
                        setStrategyTune(defaultMaxFileSizeStrategy.tune);
                      } else {
                        setStrategyType('constant-quality');
                        setStrategyTune(defaultConstantQuality.tune);
                      }
                    }
                  }
                  value={strategyType}
                >
                  <option value={'max-file-size'}>have max file size of</option>
                  <option value={'constant-quality'}>be of constant quality</option>
                </select>

                {strategyType === 'max-file-size' ?
                  <ConfigMaxFileSize onChange={size => {
                    setStrategyTune(size)
                  }}/> :
                  <ConfigConstantQuality onChange={quality => {
                    setStrategyTune(quality)
                  }}/>
                }
              </div>
              <div className={css.right}>
                <ConfigVideoSettings
                  onChange={setVideoSettings}
                  details={videoDetails}
                />
              </div>
            </div>
            <hr/>
            <SpeedSlider
              className={css.speedSlider}
              highSpeedText={strategyType === 'max-file-size' ? 'High Speed' : 'High Speed'}
              lowSpeedText={strategyType === 'max-file-size' ? 'High Quality' : 'Small File Size'}
              onChange={
                useCallback(
                  speedIndex => setStrategySpeed(speedIndex),
                  [strategySpeed, setStrategySpeed]
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