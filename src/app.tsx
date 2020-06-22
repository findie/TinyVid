import '../electron/helpers/log'
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

import {Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, ThemeProvider} from "@material-ui/core";
import {Theme} from "./helpers/theme";
import {DurationInfo} from "./components/duration-info";
import {ErrorLike} from "../electron/protocols/base-protocols";
import {ErrorDisplayModal} from "./components/error";
import {RendererFileHelpers} from "./helpers/file";
import {ThemeSwitch} from "./components/theme-switch";
import {BitrateWarnings} from "./components/bitrate-warnings";
import {PreventClosing} from "./components/prevent-closing";
import {remote} from "electron";
import {Videocam} from "@material-ui/icons";

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
    if (!file) {
      return console.warn('refusing to start process with empty video field');
    }

    const strategy: RenderStrategy = { type: strategyType, tune: strategyTune, speed: strategySpeed };

    const fout = remote.dialog.showSaveDialogSync(
      remote.getCurrentWindow(),
      {
        title: 'Output location',
        defaultPath: RendererFileHelpers.generateFileOutName(file, range, strategy, videoSettings),
        buttonLabel: 'Save & Start',
        filters: [{ name: 'Video', extensions: ['mp4'] }],
        properties: ['createDirectory', 'showOverwriteConfirmation']
      });

    if (!fout) {
      return console.warn('refusing to start process with empty output location');
    }

    // box in the range by one frame to account for browser frame inaccuracy
    const frameTime = (1 / (videoDetails?.fps || 60));
    const start = range.start + frameTime;
    const end = Math.max(start + frameTime, range.end - frameTime);

    const data = await TrimComms.startProcess(
      file,
      fout,
      { start, end },
      strategy,
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
          <ThemeSwitch theme={theme} onClick={() => setTheme(Theme.setNext())}/>

          {
            strategyType === "max-file-size" ?
              <BitrateWarnings
                fileSizeInBytes={strategyTune}
                className={css.alert}
                duration={range.end - range.start}
                videoDetails={videoDetails}
                videoSettings={videoSettings}
              /> :
              null
          }
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

          <Box>
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

            <Box marginX={2} marginY={1} className={css.controls}>
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

                <Box marginTop={2} style={{display: 'flex'}}>
                  <SpeedSlider
                    className={css.speedSlider}
                    highSpeedText={strategyType === 'max-file-size' ? 'Faster Processing' : 'Faster Processing'}
                    lowSpeedText={strategyType === 'max-file-size' ? 'Better Quality' : 'Smaller File Size'}

                    highSpeedTooltip={
                      strategyType === 'max-file-size' ?
                        'Process will finish faster but video quality will suffer' :
                        'Process will finish faster but file size will be larger'
                    }
                    lowSpeedTooltip={
                      strategyType === 'max-file-size' ?
                        'Process will finish slower but video will be at the best quality it can' :
                        'Process will finish slower but file will be at the lowest size quality'
                    }


                    onChange={
                      useCallback(
                        speedIndex => setStrategySpeed(speedIndex),
                        [strategySpeed, setStrategySpeed]
                      )
                    }
                  />

                  <Box marginLeft={2}>
                    <Button
                      startIcon={<Videocam/>}
                      variant="contained"
                      className={css.processBtn}
                      color={"secondary"}
                      disabled={!file}
                      onClick={startProcessing}
                    >Process
                    </Button>
                  </Box>
                </Box>
              </div>

            </Box>
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

        <PreventClosing prevent={!!processingID}/>
      </div>
    </ThemeProvider>
  )
}

ReactDom.render(<App/>, mainElement);