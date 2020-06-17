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
  return Math.round(n * p) / p;
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

export function between(min: number, val: number, max: number): boolean {
  if (min > val) return false;
  if (max < val) return false;
  return true;
}