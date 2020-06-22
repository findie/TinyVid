// merge object deep
// original object being a complex object
// cover being something to replace deep like { a: { b: { c: 'red' } } }
// leaving all other keys intact.
export function objectMergeDeep<T1, T2>(original: T1, cover: T2): T1 & T2 {
  const coverKeys: (keyof T2)[] = Object.keys(cover) as (keyof T2)[];

  coverKeys
    .forEach((key) => {
      if ((original as T1 & T2)[key] && cover[key] && typeof cover[key] === 'object' && !(cover[key] instanceof Date)) {
        objectMergeDeep((original as T1 & T2)[key], cover[key]);
      } else {
        // update properties if they're not objects
        (original as T1 & T2 as T2)[key] = cover[key];
      }
    });

  return original as T1 & T2;
}