import { Injectable } from '@angular/core';
import { WindowRef } from './WindowRef';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {
  private get sessionStorage() {
    return this.windowRef.nativeWindow.sessionStorage;
  }

  constructor(private windowRef: WindowRef) {}

  /**
   * Empties all keys in the session storage
   * @returns undefined
   */
  clear() {
    return this.sessionStorage.clear();
  }

  /**
   * Add that key to the given Storage object,
   * @param key A DOMString containing the name of the key you want to create/update.
   * @param value A DOMString containing the value you want to give the key you are creating/updating.
   * @returns undefined
   */
  setItem(key: string, value: string | { toString: () => string }) {
    this.sessionStorage.setItem(key, value);
  }

  /**
   * when passed a key name, will return that key's value, or null if the key does not exis
   * @param key The key to look up
   * @returns A DOMString containing the value of the key. If the key does not exist, null is returned.
   */
  getItem(key: string) {
    return this.sessionStorage.getItem(key);
  }

  /**
   * When passed a number n, returns the name of the nth key in a given Storage objec
   * @param n The index to look up
   * @returns A DOMString containing the name of the key. If the index does not exist, null is returned
   */
  key(n: number) {
    return this.sessionStorage.key(n);
  }

  /**
   * When passed a key name, will remove that key from the given Storage object if it exists
   * @param key The key to lookup
   * @returns undefined
   */
  removeItem(key: string) {
    return this.sessionStorage.removeItem(key);
  }

  /**
   * Gets keys and values that match
   */
  matchKeys(pattern: RegExp) {
    const map = new Map<string, string>();

    for (const key of Object.keys(this.sessionStorage)) {
      // Guard against keys that don't match
      if (!key.match(pattern)) continue;

      // Add the key to the return map
      map.set(key, this.sessionStorage.getItem(key));
    }

    return map;
  }
}
