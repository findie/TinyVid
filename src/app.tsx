import React, {useState} from 'react';
import ReactDom from 'react-dom';
import {ChooseFile} from "./choose-file";
import {Display} from "./display";

const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

const App = () => {

  const [file, setFile] = useState('');

  return (<div>
      <ChooseFile fileCB={setFile}></ChooseFile>
      <Display file={file}></Display>
    </div>
  )
}

ReactDom.render(<App/>, mainElement);