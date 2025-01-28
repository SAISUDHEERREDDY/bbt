import { Injectable } from '@angular/core';
import { WindowRef } from './WindowRef';

@Injectable({
  providedIn: 'root'
})
export class QmlService {
  public get detectsQt() {
    return !!this.window.nativeWindow.qt;
  }

  public get isAvailable() {
    return Boolean(this.qml);
  }

  public get qml() {
    return this.window.nativeWindow.qml;
  }

  constructor(private window: WindowRef) {}

  log(...messages) {
    if (!this.isAvailable) return; // Guard against null case

    for (const message of messages) {
      this.qml?.qmlLog(message);
    }
  }
}
