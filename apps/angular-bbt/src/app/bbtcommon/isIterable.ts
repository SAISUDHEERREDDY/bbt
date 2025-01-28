/**
 * Determines if an object is iterable
 * @param obj
 */
export function isIterable(obj: any): boolean {
  if (!obj) {
    return false;
  }

  // Check for iterator
  return typeof obj[Symbol.iterator] === 'function';
}
