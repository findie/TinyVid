import React, {useState} from "react";
import css from './style.css'
import {remote} from 'electron'

export interface ChooseFileProps {
  fileCB: (path: string) => void
}

export const ChooseFile = (props: ChooseFileProps) => {

  const [file, setFile] = useState('');

  const chooseFileCallback = async () => {
    const files = await remote.dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        {
          name: 'Video',
          extensions: ['mp4']
        }
      ]
    });

    if (!files.canceled && files.filePaths[0]) {
      setFile(files.filePaths[0]);
      props.fileCB(files.filePaths[0]);
    }
  }

  return (
    <div>
      <div className={css.fileUpload} onClick={chooseFileCallback}>
        <div className={css.fileSelect}>
          <div className={css.fileSelectButton} id="fileName">Choose File</div>
          <div className={css.fileSelectName} id="noFile">{file || 'No file chosen...'}</div>
        </div>
      </div>
    </div>
  )

}