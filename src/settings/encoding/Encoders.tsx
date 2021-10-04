import React from 'react'
import {observer} from "mobx-react";
import {Card, CardActionArea, CardContent, Radio, RadioGroup, Typography} from "@material-ui/core";
import classes from './Encoders.modules.scss';
import classNames from "classnames";
import {Processors} from "../../global-stores/process-codec-stores";
import {RendererSettings} from "../../helpers/settings";
import {action} from "mobx";


const encoders: {
  // todo make enum of codecs
  codec: keyof typeof Processors,
  name: React.ReactNode,
  desc: React.ReactNode,
  className?: string
  coda?: boolean
  disabled?: boolean
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
    // @ts-ignore
    codec: 'libaom-av1',
    name: 'AV1',
    desc: 'Slow encoder, works on a small selection of modern devices and produces small file sizes.',
    className: classNames(classes.disabled, classes.notImplemented),
    disabled: true,
  },
  {
    // @ts-ignore
    codec: 'nvenc_h264',
    name: 'NvEnc H.264',
    desc: 'Fast encoder, works on all modern devices and produces fair file sizes. ' +
      'This encoder is faster than H.264 but produces larger file sizes',
    coda: true,
    className: classNames(classes.disabled, classes.noCompatibleGpu),
    disabled: true,
  },
  {
    // @ts-ignore
    codec: 'nvenc_hevc',
    name: 'NvEnc HEVC',
    desc: 'Fast encoder, works on a small selection of modern devices and produces fair file sizes. ' +
      'This encoder is faster than H.265 but produces larger file sizes',
    className: classNames(classes.disabled, classes.noCompatibleGpu),
    coda: true,
    disabled: true,
  },
]

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
            className={classNames(classes.encoder, e.className)}
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

                {e.coda && (
                  <Typography className={classes.gpu} variant="h6">Nvidia GPU</Typography>
                )}
              </CardContent>
            </CardActionArea>
          </Card>
        ))}

      </RadioGroup>
    </>
  )
})
