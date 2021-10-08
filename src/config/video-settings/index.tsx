import React, {useEffect} from "react";
import * as css from './style.css';
import {Box, FormControl, InputLabel, MenuItem, Select} from "@material-ui/core";
import {observer} from "mobx-react";
import {useProcess} from "../../global-stores/contexts/Process.context";

export interface ConfigVideoSettingsProps {
  disabled?: boolean
  canUpscale?: boolean
}

export const ConfigVideoSettings = observer(function ConfigVideoSettings(props: ConfigVideoSettingsProps) {

  const store = useProcess()

  const details = store.videoDetails;

  const originalVideoHeight: number | null = details?.height || null;
  const originalVideoFPS: number | null = details?.fps || null;

  const videoHeight = store.videoSettings.height;
  const videoFPS = store.videoSettings.fps;

  useEffect(() => {
    if (originalVideoFPS && originalVideoFPS <= videoFPS) {
      store.setVideoSettings('fps', 'original');
    }
    if (originalVideoHeight && originalVideoHeight <= videoHeight) {
      store.setVideoSettings('height', 'original');
    }
  }, [originalVideoHeight, originalVideoFPS]);

  return (
    <div className={css.maxFileSizeConfig}>
      <Box marginRight={2}>
        <FormControl disabled={props.disabled}>
          <InputLabel id={'frame-size'}>Resolution</InputLabel>
          <Select
            labelId={'frame-size'}
            onChange={e => store.setVideoSettings('height',
              e.target.value === 'original' ?
                'original' :
                parseInt(e.target.value as string)
            )}
            value={videoHeight}
          >
            <MenuItem value={'original'}>
              {originalVideoHeight ? originalVideoHeight + 'p (original)' : 'Original Size'}
            </MenuItem>
            {
              [1440, 1080, 720, 480, 360]
                .filter(x => x < (props.canUpscale ? Infinity : details?.height || Infinity))
                .map(x => <MenuItem value={x} key={x}>{x}p</MenuItem>)
            }
          </Select>
        </FormControl>
      </Box>

      <FormControl disabled={props.disabled}>
        <InputLabel id={'video-fps'}>FPS</InputLabel>
        <Select
          onChange={e => store.setVideoSettings('fps',
            e.target.value === 'original' ?
              'original' :
              parseInt(e.target.value as string)
          )}
          value={videoFPS}
          labelId={'video-fps'}
        >
          <MenuItem value={'original'}>
            {details?.fps ? details.fps + ' FPS (original)' : 'Original FPS'}
          </MenuItem>
          {
            [144, 120, 60, 48, 30, 24, 20, 15]
              .filter(x => x < (props.canUpscale ? Infinity : details?.fps || Infinity))
              .map(x => <MenuItem value={x} key={x}>{x} FPS</MenuItem>)
          }
        </Select>
      </FormControl>

    </div>
  );
});
