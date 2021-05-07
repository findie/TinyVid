import {MediaDetails} from "./types";

export function ff_countAudioTracks(data: MediaDetails) {
  let cnt = 0;
  for (let i = 0; i < data.streams.length; i++) {
    if (data.streams[i].codec_type === 'audio') {
      cnt++
    }
  }
  return cnt;
}

export function ff_getAudioTrackIndexes(data: MediaDetails) {
  return data.streams.filter(x => x.codec_type === 'audio').map(x => x.index);
}
