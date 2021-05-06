/**
 Copyright Findie 2021
 */
import 'source-map-support/register'
import {corsHoF} from "./helpers/cors";
import {extname} from 'path';

const corsedHandler = corsHoF(handleRequest);
addEventListener('fetch', event => {
  event.respondWith(corsedHandler(event));
});

function prettify(data: any, depth = 0): string[] {

  let lines: string[] = [];

  const keys = Object.keys(data) as (keyof typeof data)[];
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const v = data[k];

    if (v === undefined) continue;

    if (v instanceof Object) {
      lines.push(`${k.toString()}:`)
      lines = lines.concat(prettify(v, depth + 1).map(x => '  ' + x));
      if (depth === 0) {
        lines.push('');
      }
    } else {
      lines.push(`${k.toString()}: ${v}`);
    }
  }

  return lines;
}

async function handleRequest(event: FetchEvent) {
  const request = event.request;

  if (request.method.toLowerCase() !== 'post') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: {
        'Content-type': 'application/json',
      },
    })
  }

  let data;
  try {
    data = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Cannot parse JSON' }), {
      status: 400,
      headers: {
        'Content-type': 'application/json',
      },
    })
  }

  const _files: { filename: string, contents: string }[] = data._files;
  delete data._files;

  data.Requester = {
    Country: request.headers.get('cf-ipcountry'),
    City: request.cf?.city,
    ID: request.headers.get('cf-connecting-ip'),
    TZ: request.cf?.timezone,
    Path: request.url,
    Method: request.method
  };

  const text = prettify(data).join('\n');

  const message = await send2slack('```' + text + '```');

  await Promise.all((_files || []).map(({ filename, contents }) =>
    upload2slack(filename, contents, message.ts))
  );

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-type': 'application/json',
    },
  })
}

async function send2slack(text: string) {

  const fd = new FormData();
  fd.append('token', 'xoxb-2925235932-1921709302278-JWuuVtOQlSwV3m60EWp1V8qP');
  fd.append('channel', 'C01U08AF74Y');
  fd.append('text', text);

  const r = await fetch('https://slack.com/api/chat.postMessage\n', {
    method: 'post',
    body: fd
  });

  return await r.json();
}

async function upload2slack(filename: string, data: string, thread?: string) {
  const fd = new FormData();
  fd.append('content', data);
  fd.append('channels', 'C01U08AF74Y');
  fd.append('filename', filename);
  if (extname(filename) === '.log' || extname(filename) === '.txt') {
    fd.append('filetype', 'text');
  }

  if (thread) {
    fd.append('thread_ts', thread);
  }

  const r = await fetch('https://slack.com/api/files.upload', {
    method: 'post',
    headers: {
      Authorization: 'Bearer xoxb-2925235932-1921709302278-JWuuVtOQlSwV3m60EWp1V8qP'
    },
    body: fd
  });

  console.log(await r.text());
}
