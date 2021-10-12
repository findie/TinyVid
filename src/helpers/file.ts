import * as path from "path";
import {RenderStrategy, VideoSettings} from "../../electron/types";
import {existsSync} from "fs";
import {v4 as uuid} from "uuid";
import {dialog, getCurrentWindow} from "@electron/remote";
import type {FileFilter} from "electron";
import {isWindows} from "../../electron/helpers";

export namespace RendererFileHelpers {


  function _generateFileOutNameHelper(index: number | string, fileIn: string, range: { start: number, end: number }, strategy: RenderStrategy, settings: VideoSettings) {

    const pth = path.parse(fileIn);

    return path.join(
      pth.dir,
      [
        pth.name,
        range.end > range.start ?
          range.start.toFixed(2) + '-' + range.end.toFixed(2) :
          '',
        'compressed' + (index ? `-${index}` : ''),
        'mp4'
      ]
        .filter(x => !!x)
        .join('.')
    );
  }

  export function generateFileOutName(fileIn: string, range: { start: number, end: number }, strategy: RenderStrategy, settings: VideoSettings): string {

    for (let index = 0; index < 1000; index++) {

      const name = _generateFileOutNameHelper(index, fileIn, range, strategy, settings);
      if (!existsSync(name)) {
        return name;
      }

    }

    return _generateFileOutNameHelper(uuid().split('-')[0], fileIn, range, strategy, settings);

  }

  export async function requestFileSaveDialog(defaultPath: string) {
    return await dialog.showSaveDialog(
      getCurrentWindow(),
      {
        title: 'Output location',
        defaultPath: defaultPath,
        buttonLabel: 'Save & Start',
        filters: [{ name: 'Video', extensions: ['mp4'] }],
        properties: ['createDirectory', 'showOverwriteConfirmation']
      });
  }

  // https://en.wikipedia.org/wiki/Video_file_format
  export const videoFilters: FileFilter[] = [
    {extensions: ['webm'], name: 'WebM'},
    {extensions: ['mkv'], name: 'Matroska'},
    {extensions: ['mp4', 'm4p', 'm4v'], name: 'MP4 / MPEG-4 Part 14'},
    {extensions: ['flv', 'f4v', 'f4p', 'f4a', 'f4b'], name: 'Flash Video'},
    {extensions: ['gif'], name: 'GIF'},
    {extensions: ['avi'], name: 'AVI'},
    {extensions: ['mov', 'qt'], name: 'QuickTime File Format'},
    {extensions: ['vob'], name: 'Vob'},
    {extensions: ['ogv', 'ogg'], name: 'Ogg Video'},
    {extensions: ['drc'], name: 'Dirac'},
    {extensions: ['mts', 'm2ts', 'ts'], name: 'MPEG Transport Stream'},
    {extensions: ['wmv'], name: 'Windows Media Video'},
    {extensions: ['rm'], name: 'RealMedia'},
    {extensions: ['rm', 'rmvb'], name: 'RealMedia'},
    {extensions: ['viv'], name: 'VivoActive'},
    {extensions: ['amv'], name: 'AMV video format'},
    {extensions: ['mpg', 'mp2', 'mpeg', 'mpe', 'mpv'], name: 'MPEG-1'},
    {extensions: ['mpg', 'mpeg', 'm2v'], name: 'MPEG-2 – Video'},
    {extensions: ['3gp'], name: '3GPP'},
    {extensions: ['3g2'], name: '3GPP2'},
    {extensions: ['mxf'], name: 'Material Exchange Format'},
    {extensions: ['nsv'], name: 'Nullsoft Streaming Video'},
  ];

  if(!isWindows) {
    videoFilters.forEach(f => {
      f.name += ` (${f.extensions.join(', ')})`;
    });
  }

  videoFilters.unshift({
    extensions: videoFilters.reduce<string[]>((a, c) => a.concat(c.extensions), []),
    name: 'All Supported Formats'
  });

}
