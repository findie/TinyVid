# Quick Trim
_Trim & compress video footage_

![image](https://raw.githubusercontent.com/legraphista/QuickTrim/master/docs/splash.png)

## How to!

1) Open an .mp4 video file
2) Choose the trim area
3) Choose between having a max file size or having a constant quality
4) Edit your desired output settings
5) Click Process, and you're all set!

## Roadmap

- add settings page with various options
- add support for H265 encoder
- add support for AV1 encoder
- add support for NVidia h264/h265 encoders on windows
- add a queue for batching file processing

## Known Limitations

- previewing is only supported for H264/VP9 videos with yuv420p or yuv444p formats
  - previewing will work for:
    - screen/game recordings 
    - internet downloaded videos
    - Android/iPhone videos
  - previewing may not work for:
    - GoPro's recordings (they record in a deprecated pixel format, yuvj420p)