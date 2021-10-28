/**
 Copyright Findie 2021
 */


export function enforceObjectRecordIntegrity<T>() {
  return <Keys extends string>(object: Record<Keys, T>) => object;
}

export function assertTrue(value: boolean, message: string): asserts value is true {
  if(!value){
    throw new Error(message);
  }
}
