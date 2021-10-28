import {plural} from "./language";

export function clip(min: number, val: number, max: number): number {
  if (min > val) return min;
  if (max < val) return max;
  return val;
}

export function range(start: number, end: number, step: number): number[] {
  const arr: number[] = [];
  if (start < end) {
    for (let i = start; i < end; i += step) {
      arr.push(i);
    }
  } else {
    for (let i = start; i > end; i += step) {
      arr.push(i);
    }
  }
  return arr;
}

export function round(n: number, decimals: number): number {
  const p = 10 ** decimals;
  return Math.round(n * p + Number.EPSILON) / p;
}

export function bps2text(bps: number): string {

  let unit = 'bps';
  if (bps > 1024) {
    bps /= 1024;
    unit = 'Kbps';
  }
  if (bps > 1024) {
    bps /= 1024;
    unit = 'Mbps';
  }

  return `${bps.toFixed(1)}${unit}`;
}

export function b2text(b: number): string {

  let unit = 'B';
  if (b > 1024) {
    b /= 1024;
    unit = 'KB';
  }
  if (b > 1024) {
    b /= 1024;
    unit = 'MB';
  }
  if (b > 1024) {
    b /= 1024;
    unit = 'GB';
  }

  return `${b.toFixed(1)}${unit}`;
}

export function between(min: number, val: number, max: number): boolean {
  if (min > val) return false;
  if (max < val) return false;
  return true;
}

export function arrIsConsistent(arr: number[]): boolean {
  const template = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (template !== arr[i]) return false;
  }
  return true;
}

function pad2(n: number, decimals = 0): string {
  if (decimals === 0) {
    return n >= 10 ? Math.floor(n).toString() : `0${Math.floor(n)}`;
  }
  return n >= 10 ? n.toFixed(decimals) : `0${n.toFixed(decimals)}`;
}

export function seconds2time(seconds: number, precision = 2, extended = false): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds / 60) % 60;
  const s = seconds % 60;

  if (extended) {
    return `\
${h ? `${pad2(h)} ${plural('hour', h)} ` : ''}\
${m ? `${pad2(m)} ${plural('minute', m)} ` : ''}\
${pad2(s, precision)} ${plural('second', s)}\
`;
  }

  return `\
${h ? `${pad2(h)}h ` : ''}\
${m ? `${pad2(m)}m ` : ''}\
${pad2(s, precision)}s\
`;
}
