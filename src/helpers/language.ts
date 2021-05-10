export function plural(item: string, number: number, ending: string = 's'): string {
  return `${item}${number !== 1 ? ending : ''}`;
}


export function pluralWithValue(number: number, item: string, ending?: string): string;
export function pluralWithValue(item: string, number: number, ending?: string): string;
export function pluralWithValue(A: number | string, B: number | string, ending: string = 's'): string {

  const item = typeof A === 'string' ? A : B;
  const number = typeof A === 'number' ? A : B;

  if (typeof A === 'number') {
    // number comes first
    return `${number} ${item}${number !== 1 ? ending : ''}`;
  }
  // item comes first
  return `${item}${number !== 1 ? ending : ''} ${number}`;
}
