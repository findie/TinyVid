/**
 Copyright Findie 2021
 */

export namespace VideoHelpers {

  // todo Check out the wcjs-player & wcjs-prebuilt modules to add VLC support

  export function supportedVideoCodec(codec: string) {
    codec = codec.toLowerCase()
    return (
      codec === 'vp9' ||
      codec === 'vp8' ||
      codec === 'h264'
    )
  }

  export function supportedPixelFormat(pix: string) {
    return (
      pix === 'yuv420p' ||
      pix === 'yuv444p' ||
      pix === 'yuvj420p'
    )
  }

  export function supportedFormatContainer(formats: string[]) {
    return formats.some(f => (
      f === 'mp4' ||
      f === 'ogg' ||
      f === 'webm'
    ))
  }
}
