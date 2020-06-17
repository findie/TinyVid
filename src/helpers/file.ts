import * as path from "path";
import {RenderStrategy, VideoSettings} from "../../electron/types";
import {existsSync} from "fs";
import {v4 as uuid} from "uuid";

export namespace RendererFileHelpers {


  function _generateFileOutNameHelper(index: number | string, fileIn: string, range: { start: number, end: number }, strategy: RenderStrategy, settings: VideoSettings) {

    const pth = path.parse(fileIn);

    return path.join(
      pth.dir,
      [
        pth.name,
        range.start.toFixed(2) + '-' + range.end.toFixed(2),
        'compressed' + (index ? `-${index}` : ''),
        'mp4'
      ].join('.')
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

}