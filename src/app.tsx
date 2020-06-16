import './types'
import React, {useCallback, useEffect, useRef, useState} from 'react';
import ReactDom from 'react-dom';
import {ChooseFile} from "./choose-file";
import {Display} from "./display";
import {TrimSlider} from "./components/trim-select";
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
import {Loading} from "./components/loading";

import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  ThemeProvider
} from "@material-ui/core";
import {Theme} from "./helpers/theme";
import {DurationInfo} from "./components/duration-info";
import {Brightness2 as DarkIcon, Brightness5 as LightIcon, BrightnessAuto as AutoIcon} from '@material-ui/icons'
import {ErrorLike} from "../electron/protocols/base-protocols";
import {ErrorDisplayModal} from "./components/error";

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

const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

const App = () => {
  mainElement.style.background = Theme.current().palette.background.default;

  const [theme, setTheme] = useState<Theme.ThemeNames>(Theme.currentName());
  const [error, setError] = useState<Error | ErrorLike | null>(null);

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

    const fout = `${file}.${range.start.toFixed(2)}-${range.end.toFixed(2)}.compressed.mp4`

    // box in the range by one frame to account for browser frame inaccuracy
    const frameTime = (1 / (videoDetails?.fps || 60));
    const start = range.start + frameTime;
    const end = Math.max(start + frameTime, range.end - frameTime);

    const data = await TrimComms.startProcess(
      file,
      fout,
      { start, end },
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
      .catch(setError);

  }, [file]);

  useEffect(function cleanupOnError() {
    if (error) {
      setProcessingID(null);
      setFile('');
    }
  }, [error]);

  return (
    <ThemeProvider theme={Theme.current()}>
      <div className={css.app}>
        <Paper elevation={3} className={css.header} square={true}>
          <ChooseFile fileCB={setFile} className={css.flexGrow + ' ' + css.fileSelect}/>
          <IconButton onClick={() => setTheme(Theme.setNext())}>
            {theme === 'system' ? <AutoIcon/> :
              theme === 'dark' ? <DarkIcon/> :
                <LightIcon/>
            }
          </IconButton>
        </Paper>
        <Display
          className={css.display}
          file={file}
          ref={videoElementRef}
        />
        <Paper className={css.footer} elevation={3} square={true}>
          {file ?
            <DurationInfo
              className={css.info}
              start={range.start}
              end={range.end}
            /> :
            null
          }

          <Box paddingX={2} paddingY={2}>
            <TrimSlider
              step={videoDetails ? 1 / videoDetails.fps : 0}
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
                    <FormControl>
                      <InputLabel id="strategy-label">Output must</InputLabel>
                      <Select
                        labelId={"strategy-label"}
                        value={strategyType}
                        variant={"standard"}
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
                      >
                        <MenuItem value={'max-file-size'}>have max file size of</MenuItem>
                        <MenuItem value={'constant-quality'}>be constant quality of</MenuItem>
                      </Select>
                    </FormControl>

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

              <Box marginLeft={2}>
                <Button
                  variant="contained"
                  className={css.processBtn}
                  disabled={!file}
                  onClick={startProcessing}
                >Process
                </Button>
              </Box>
            </div>
          </Box>
        </Paper>

        {processingID ?
          <ProcessingOverlay
            fileIn={file}
            fileOut={fileOut || ''}
            id={processingID}
            onDone={() => setProcessingID(null)}
            onCancelRequest={() => TrimComms.cancelProcess(processingID)}
          /> :
          null
        }

        {
          file && !videoDetails ? <Loading/> : null
        }

        {
          error ? <ErrorDisplayModal error={error} onOk={() => {
            setError(null);
          }}/> : null
        }
      </div>
    </ThemeProvider>
  )
}

ReactDom.render(<App/>, mainElement);