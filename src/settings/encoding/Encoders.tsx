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
  // todo make enum of codecs
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
    // @ts-ignore
    codec: 'h264_nvenc',
    name: 'NvEnc H.264',
    desc: 'Fast encoder, works on all modern devices and produces fair file sizes. ' +
      'This encoder is faster than H.264 but produces larger file sizes',
    cuda: true,
    disabled: true,
    noGPUCompat: true
  },
  {
    // @ts-ignore
    codec: 'hevc_nvenc',
    name: 'NvEnc HEVC',
    desc: 'Fast encoder, works on a small selection of modern devices and produces fair file sizes. ' +
      'This encoder is faster than H.265 but produces larger file sizes',
    cuda: true,
    disabled: true,
    noGPUCompat: true
  },
]

ff_encoders_map.then(map => {
  encoders.forEach(e => {
    if (map.has(e.codec)) {
      e.disabled = false;

      if (e.cuda) {
        checkIfEncoderWorks(e.codec).then(
          () => e.noGPUCompat = false,
          () => e.noGPUCompat = true
        );
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

                {e.cuda && (
                  <Typography className={classNames(classes.banner, classes.gpu)} variant="h6">Nvidia GPU</Typography>
                )}
                {e.experimental && (
                  <Typography className={classNames(classes.banner, classes.experimental)}
                              variant="h6">Experimental</Typography>
                )}
              </CardContent>
            </CardActionArea>
          </Card>
        ))}

      </RadioGroup>
    </>
  )
})
