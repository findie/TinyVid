export function clip(min: number, val: number, max: number): number {
  if (min > val) return min;
  if (max < val) return max;
  return val;
}

export function range(start: number, end: number, step: number): number[] {
  const arr: number[] = [];
  for (let i = start; i < end; i += step) {
    arr.push(i);
  }
  return arr;
}