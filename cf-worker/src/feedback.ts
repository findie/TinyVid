/**
 Copyright Findie 2021
 */
import 'source-map-support/register'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
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

async function handleRequest(request: Request) {
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

  data.Requester = {
    Country: request.headers.get('cf-ipcountry'),
    City: request.cf?.city,
    ID: request.headers.get('cf-connecting-ip'),
    TZ: request.cf?.timezone,
    Path: request.url,
    Method: request.method
  };

  const text = prettify(data).join('\n');

  await send2slack('```' + text + '```');

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-type': 'application/json',
    },
  })
}

async function send2slack(text: string) {

  await fetch('https://hooks.slack.com/services/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', {

    method: 'post',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ text })

  });

}
