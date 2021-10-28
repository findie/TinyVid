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
const OTPLib = require('otplib');

const pipelineAsync = util.promisify(require("stream").pipeline);

const rlInterface = process.env.OTP_SECRET ?
  null :
  readline.createInterface({
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

const getCredentialIDAwaitLock = new AwaitLock();
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
  //console.log('uploading file', path, contentType, (fs.statSync(path).size / 2 ** 20).toFixed(2) + 'MB');

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

  //console.log('uploaded file ID', json.id, path);

  return json.id;
}

async function signAndGetDlStream(fileID) {
  //console.log('signing file', fileID);

  const OTP_SECRET = process.env.OTP_SECRET;
  let otp;
  if (!OTP_SECRET) {
    otp = await new Promise((res, rej) => {
      rlInterface.question("Type in the OTP code from eSigner:", function (otp) {
        if (otp.length !== 6) return rej('OTP needs to be 6 chars');
        if (!/^[0-9]*$/.test(otp)) return rej('OTP is not numeric');
        return res(otp);
      })
    });
  } else {
    otp = OTPLib.authenticator.generate(OTP_SECRET);
    //console.log('Generated OTP:', otp);
  }

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

const allStepsSigAwaitLock = new AwaitLock();

async function allStepsSign(inPath, outPath = inPath) {
  //console.log('waiting turn to sign', inPath);
  await allStepsSigAwaitLock.acquireAsync();
  try {

    await refreshToken();

    const credID = await getCredentialID();

    const fileID = await upload(
      inPath,
      `application/${path.extname(inPath).substr(1)}`,
      credID
    );

    const dlBody = await signAndGetDlStream(fileID);

    // console.log('downloading signed file to', outPath);
    await pipelineAsync(
      dlBody,
      fs.createWriteStream(outPath)
    );

    console.log('done signing', inPath);
  } finally {
    allStepsSigAwaitLock.release();
  }
}

const alreadySigned = new Set();
exports.default = async function (configuration) {
  // console.log(util.inspect(configuration));

  const { path } = configuration;

  if (alreadySigned.has(path)) {
    return console.log('Already signed', path);
  }

  alreadySigned.add(path);

  console.log('signing', path, (fs.statSync(path).size / 2 ** 20).toFixed(2) + 'MB');

  for (let i = 0; i < 10; i++) {
    try {
      // const out = /TinyVid-win-0\.14\.4\.exe/ig.test(path) ? path + '.signed.exe' : path;
      if (!process.env.NO_SIGN) {
        await allStepsSign(path/*, out*/);
      } else {
        console.log('Skipping signature for', path);
      }
      return;
    } catch (e) {
      console.log(e);
      console.log('retrying', i, path);
    }
  }

  throw new Error('failed to sign', path);
};

