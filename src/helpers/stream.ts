/**
 Copyright Findie 2021
 */

// code adapted from https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultReader/read
export async function* streamToLineIterator(stream: ReadableStream<string>) {
  const reader = stream.getReader();

  let { value: chunk = '', done: readerDone } = await reader.read();
  let re = /\r\n|\n|\r/gm;
  let startIndex = 0;

  while (true) {
    let result = re.exec(chunk);
    if (!result) {
      if (readerDone) {
        break;
      }

      let remainder = chunk.substr(startIndex);

      const read = await reader.read();
      chunk = read.value ?? '';
      readerDone = read.done;

      chunk = remainder + chunk;
      startIndex = re.lastIndex = 0;
      continue;
    }
    yield chunk.substring(startIndex, result.index);
    startIndex = re.lastIndex;
  }
  if (startIndex < chunk.length) {
    // last line didn't end in a newline char
    yield chunk.substr(startIndex);
  }
}
