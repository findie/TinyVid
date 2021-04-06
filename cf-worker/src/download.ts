/**
 Copyright Findie 2021
 */

import {respondJSON} from "./helpers/respond";
import * as YAML from 'js-yaml';
import {cacheHoF} from "./helpers/cache";


const cachedHandler = cacheHoF(handleRequest, 60);
addEventListener('fetch', async event => {
  event.respondWith(cachedHandler(event));
});

const baseURL = 'https://quicktrim-public-update.s3.eu-central-1.amazonaws.com/download'

type Platforms = 'win' | 'mac' | 'linux';
type Arch = 'x64';

const supportTree: { [p in Platforms]: { [a in Arch]?: string } } = {
  win: {
    x64: 'latest.yml'
  },
  mac: {
    x64: 'latest-mac.yml',
  },
  linux: {
    x64: 'latest-linux.yml'
  }
}

type BuildData = {
  path: string
  sha512: string
  releaseDate: string
  version: string
  files: {
    url: string,
    sha512: string
    size: number
  }[]
};

async function fetchData(p: Platforms, a: Arch): Promise<BuildData | null> {
  const latestYML = supportTree[p]?.[a];

  if (!latestYML) return null;

  const YAML_URL = baseURL + '/' + 'latest' + '/' + p + '/' + a + '/' + latestYML;

  const YAML_TEXT = await (await fetch(YAML_URL, {
    // cf: {
    //   cacheEverything: true,
    //   cacheTtl: 5 * 60,
    //   cacheTtlByStatus: {
    //     "200-299": 5 * 60,
    //     404: 1,
    //     "500-599": 0
    //   }
    // }
  })).text();

  return YAML.load(YAML_TEXT) as BuildData;
}

const handleDownloadRegex = /^\/(\w+)\/(\w+)\/?/;

async function handleDownloadRedirect(request: Request) {
  const url = new URL(request.url);

  const urlData = handleDownloadRegex.exec(url.pathname);
  if (!urlData || request.method.toLowerCase() !== 'get') {
    return respondJSON({ error: "Bad Request" }, 400);
  }

  const platform: Platforms = urlData[1] as Platforms;
  const arch: Arch = urlData[2] as Arch;

  if (!platform || !arch) {
    return respondJSON({ error: "Bad Platform or Arch" }, 400);
  }

  const buildData = await fetchData(platform, arch);

  if (!buildData) {
    return respondJSON({ error: 'Not Found', data: { platform, arch } }, 404)
  }

  const { path } = buildData;

  return new Response('', {
    status: 302, // found
    headers: {
      'Location': baseURL + '/' + 'latest' + '/' + platform + '/' + arch + '/' + path
    }
  });
}

const handleMetadataRegex = /^\/metadata\/?$/;

async function handleMetadata(request: Request) {

  const metadataPromise: { [p in Platforms]?: { [a in Arch]?: Promise<BuildData> } } = {};

  const platforms = Object.keys(supportTree) as Platforms[];
  for (let i = 0; i < platforms.length; i++) {
    const p = platforms[i];
    const archs = Object.keys(supportTree[p]) as Arch[];

    if (!metadataPromise[p]) metadataPromise[p] = {};

    for (let j = 0; j < archs.length; j++) {
      const a = archs[j];
      metadataPromise[p][a] = fetchData(p, a);
    }
  }

  const metadata: { [p in Platforms]?: { [a in Arch]?: BuildData & { url: string } } } = {};

  for (let i = 0; i < platforms.length; i++) {
    const p = platforms[i];
    const archs = Object.keys(supportTree[p]) as Arch[];

    if (!metadata[p]) metadata[p] = {};

    for (let j = 0; j < archs.length; j++) {
      const a = archs[j];

      (metadata[p][a] as BuildData) = await metadataPromise[p][a];
      metadata[p][a].url = baseURL + '/' + 'latest' + '/' + p + '/' + a + '/' + metadata[p][a].path;
    }
  }


  return respondJSON(metadata, 200);
}

async function handleRequest(event: FetchEvent) {
  const request = event.request;
  const url = new URL(request.url);

  if (handleDownloadRegex.test(url.pathname)) {
    return handleDownloadRedirect(request);
  }

  if (handleMetadataRegex.test(url.pathname)) {
    return handleMetadata(request);
  }

  return respondJSON({ error: 'Not Found' }, 404);
}
