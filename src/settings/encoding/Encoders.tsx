import React from 'react'
import {observer} from "mobx-react";
import {Card, CardActionArea, CardContent, Radio, RadioGroup, Typography} from "@material-ui/core";
import classes from './Encoders.modules.scss';
import classNames from "classnames";
import {Processors} from "../../global-stores/process-codec-stores";
import {RendererSettings} from "../../helpers/settings";
import {action} from "mobx";
import {checkIfEncoderWorks, ff_encoders_map} from "../../../common/ff/encoders";


const encoders: {
  codec: keyof typeof Processors,
  name: React.ReactNode,
  desc: React.ReactNode,
  className?: string
  cuda?: boolean
  disabled?: boolean
  noGPUCompat?: boolean
  experimental?: boolean
}[] = [
  {
    codec: 'libx264',
    name: 'H.264',
    desc: 'Fast encoder, works on all modern devices and produces fair file sizes.',
  },
  {
    codec: 'libx265',
    name: 'H.265',
    desc: 'Slow encoder, works on a small selection of modern devices and produces small file sizes.',
  },
  {
    codec: 'libaom-av1',
    name: 'AV1',
    desc: 'Slow encoder, works on a small selection of modern devices and produces small file sizes.',
    experimental: true,
  },
  {
    codec: 'h264_nvenc',
    name: 'NvEnc H.264',
    desc: 'Fast encoder, works on all modern devices and produces fair file sizes. ' +
      'This encoder is faster than H.264 but produces larger file sizes',
    cuda: true,
    disabled: true,
    noGPUCompat: true,
    experimental: true,
  },
  {
    codec: 'hevc_nvenc',
    name: 'NvEnc HEVC',
    desc: 'Fast encoder, works on a small selection of modern devices and produces fair file sizes. ' +
      'This encoder is faster than H.265 but produces larger file sizes',
    cuda: true,
    disabled: true,
    noGPUCompat: true,
    experimental: true,
  },
]

ff_encoders_map.then(map => {
  encoders.forEach(e => {
    if (map.has(e.codec)) {

      if (e.cuda) {
        checkIfEncoderWorks(e.codec).then(
          (works) => {
            if (works) {
              e.noGPUCompat = false;
              e.disabled = false;
            } else {
              e.noGPUCompat = true;
              e.disabled = true;
            }
          }
        );
      } else {
        e.disabled = false;
      }
    }
  })
})

export const Encoders = observer(function Encoders() {

  return (
    <>
      <Typography variant="h6">Codec</Typography>

      <RadioGroup
        className={classes.encoderList}
        value={RendererSettings.settings.processor}
        onChange={action((e, v) => {
          if (v in Processors) {
            RendererSettings.settings.processor = v as keyof typeof Processors;
          }
        })}
      >

        {encoders.map((e, i) => (
          <Card
            key={e.codec}
            className={classNames(
              classes.encoder,
              e.className,
              e.disabled && classes.disabled,
              e.noGPUCompat && classes.noCompatibleGpu
            )}
          >
            <CardActionArea
              className={classes.actionArea}
              onClick={action(() => RendererSettings.settings.processor = e.codec)}
              disabled={e.disabled}
            >
              <Radio color="primary" value={e.codec}/>
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {e.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {e.desc}
                </Typography>

                <div className={classNames(classes.banner)}>
                  {e.cuda && (
                    <Typography className={classes.gpu} variant="h6">Nvidia GPU</Typography>
                  )}
                  {e.experimental && (
                    <Typography className={classes.experimental} variant="h6">Experimental</Typography>
                  )}
                </div>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}

      </RadioGroup>
    </>
  )
})
