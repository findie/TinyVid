import React, {useRef, useState} from 'react';
import ReactDom from 'react-dom';
import {ChooseFile} from "./choose-file";
import {Display} from "./display";
import {TrimSlider} from "./trim-select";
import {Done, Progress} from "./progress";
import {IFFMpegProgressData} from "ffmpeg-progress-wrapper";
import css from './style.css';

const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

const App = () => {

  const videoElementRef = useRef<HTMLVideoElement>(null)
  const [file, setFile] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [range, setRange] = useState<{ start: number, end: number }>({ start: 0, end: 0 })

  const [processing, setProcessing] = useState<IFFMpegProgressData | null>(null);
  const [isDone, setDone] = useState(false);

  const [fileOut, setFileOut] = useState<string>();
  let checkInterval: NodeJS.Timeout;

  async function checkProgress() {
    const f = await fetch('trim://' + file, {
      method: 'get'
    });
    const json: IFFMpegProgressData = await f.json();

    setProcessing(json);
    if (!json) {
      clearInterval(checkInterval);
      setDone(true);
    }
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
          console.log(e)
          setDuration(e.currentTarget.duration)
        }}
      />
      <div className={css.footer}>
        <TrimSlider
          disabled={!file}
          duration={duration || 100}
          onSlide={(values, handle, unencodedValues) => {
            const val = unencodedValues[handle];
            if (videoElementRef.current) {
              videoElementRef.current.currentTime = val;
            }
          }}
          onSet={(values, handle, unencodedValues) => setRange({
            start: unencodedValues[0],
            end: unencodedValues[1]
          })}
        />
        <button
          className={css.processBtn}
          disabled={!file}
          onClick={async () => {
            setProcessing({ speed: 0, progress: 0, eta: 0 });
            const fileOut = `${file}.${range.start.toFixed(2)}-${range.end.toFixed(2)}.mp4`
            setFileOut(fileOut);

            const f = await fetch('trim://' + file, {
              method: 'post',
              body: JSON.stringify({
                start: range.start,
                end: range.end,
                out: fileOut
              }),
              headers: { 'content-type': 'application/json' }
            });
            checkInterval = setInterval(checkProgress, 500);
          }}
        >Process
        </button>
      </div>

      {/*<Progress progress={{*/}
      {/*  processing: {*/}
      {/*    speed: 1,*/}
      {/*    eta: 10000,*/}
      {/*    progress: 0.32*/}
      {/*  }*/}
      {/*}}/>*/}

      {/*<Done onOk={console.log} file={'file out'}/>*/}

      {processing ? <Progress progress={processing}/> : null}
      {isDone ? <Done onOk={() => setDone(false)} file={fileOut}/> : null}
    </div>
  )
}

ReactDom.render(<App/>, mainElement);