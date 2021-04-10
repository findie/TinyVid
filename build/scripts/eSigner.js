/**
 Copyright Findie 2021
 */

const fetch = require('node-fetch');
const fs = require('fs');
const readline = require("readline");
const path = require('path');
const util = require('util');
require('dotenv').config();
const { default: AwaitLock } = require('await-lock');

const pipelineAsync = util.promisify(require("stream").pipeline);

const rlInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const refreshTokenAwaitLock = new AwaitLock();
let token = '';

async function refreshToken() {
  await refreshTokenAwaitLock.acquireAsync();

  if (token) {
    refreshTokenAwaitLock.release();
    return token;
  }

  console.log('fetching token');
  const client_id = process.env.SSL_CLIENT_ID;
  const refresh_token = process.env.SSL_REFRESH_TOKEN;

  if (!client_id || !refresh_token) throw new Error('cannot acquire token');

  const res = await fetch("https://login.ssl.com/oauth2/token", {
    "headers": {
      "accept": "application/json",
      "accept-language": "en-US,en;q=0.9,ro-RO;q=0.8,ro;q=0.7",
      "content-type": "application/x-www-form-urlencoded",
    },
    "body": `client_id=${client_id}&refresh_token=${refresh_token}&grant_type=refresh_token`,
    "method": "POST",
  });

  if (res.status !== 200) {
    throw new Error('failed to fetch token: ' + await res.text())
  }

  const json = await res.json();
  token = json.access_token;

  console.log('logged in!');

  refreshTokenAwaitLock.release();
  return token;
}

const getCredentialIDAwaitLock =new AwaitLock();
let credentialID = '';

async function getCredentialID() {
  await getCredentialIDAwaitLock.acquireAsync();

  if (credentialID) {
    await getCredentialIDAwaitLock.release();
    return credentialID;
  }

  console.log('fetching credentials ID');

  const res = await fetch('https://cs.ssl.com/csc/v0/credentials/list', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ clientData: "EVCS" })
  });

  if (res.status !== 200) {
    throw new Error('failed to fetch credentialIDs: ' + await res.text())
  }

  const json = await res.json();
  credentialID = json.credentialIDs[0];
  console.log('credentials ID:', credentialID);

  await getCredentialIDAwaitLock.release();
  return credentialID;
}

async function upload(path, contentType, credentialID) {
  console.log('uploading file', path, contentType);

  const res = await fetch('https://cds.ssl.com/v1/code/upload', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': contentType,
      'credential-id': credentialID
    },
    body: fs.createReadStream(path)
  });

  if (res.status !== 200) {
    throw new Error('failed to upload file: ' + await res.text());
  }

  const json = await res.json();

  console.log('uploaded file ID', json.id, path);

  return json.id;
}

async function signAndGetDlStream(fileID) {
  console.log('signing file', fileID);

  const otp = await new Promise((res, rej) => {
    rlInterface.question("Type in the OTP code from eSigner:", function (otp) {
      if (otp.length !== 6) return rej('OTP needs to be 6 chars');
      if (!/^[0-9]*$/.test(otp)) return rej('OTP is not numeric');
      return res(otp);
    })
  });

  const res = await fetch('https://cds.ssl.com/v1/code/sign', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      id: fileID,
      otp
    })
  });

  if (res.status !== 200) {
    throw new Error('failed to upload file: ' + await res.text());
  }

  return res.body;
}

async function allStepsSign(inPath, outPath = inPath) {
  await refreshToken();

  const credID = await getCredentialID();

  const fileID = await upload(
    inPath,
    `application/${path.extname(inPath).substr(1)}`,
    credID
  );

  let dlBody;
  while (!dlBody) {
    try {
      dlBody = await signAndGetDlStream(fileID);
    } catch (e) {
      console.error(e);
    }
  }

  console.log('downloading signed file to', outPath);
  await pipelineAsync(
    dlBody,
    fs.createWriteStream(outPath)
  );

  console.log('done signing', inPath);
}

exports.default = async function (configuration) {
  console.log(util.inspect(configuration));

  const { path } = configuration;

  console.log('signing', path);

  await allStepsSign(path);
};

