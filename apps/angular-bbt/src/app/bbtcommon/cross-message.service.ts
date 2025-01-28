import { Injectable } from '@angular/core';
import { fromEvent } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

/**
 * Service works as an injectable stand-in for the lifeCycleAPI expected
 * to be exposed on the window or a parent window.
 */
@Injectable({
  providedIn: 'root'
})
export class CrossMessageService {
  private appTag = '[bbt]';

  /**
   * A reactive stream that sends message intented for this app
   */
  incomingMessages$ = fromEvent(window, 'message').pipe(
    map((e: any) => e?.data),
    filter(x => x?.forApp === this.appTag)
  );

  constructor() {}

  /**
   * A helper to keep messages consistent
   * @param eventName The name for the message event
   * @param extention Additional property to copy to the message
   */
  private sendMessage(eventName: string, extention: any = {}) {
    parent?.postMessage(
      { app: this.appTag, forApp: 'any', messageType: eventName, ...extention },
      '*'
    );
  }

  /**
   * Communicates that the api should stop tracking the app activity
   */
  expectIdle(expectedLength: number = undefined): void {
    this.sendMessage('expect-idle', { expectedLength });
  }

  /**
   * Communicates that the api should resume track app activity
   */
  cancelExpectIdle(): void {
    this.sendMessage('cancel-expect-idle');
  }

  /**
   * Communicates that this application is complete and that the parent should retake control
   */
  complete(): void {
    this.sendMessage('complete');
  }

  /**
   * Pass the menu message
   */
  passMenuMessage(): void {
    this.sendMessage('menu');
  }

  /**
   * Pass the home message
   */
  passHomeMessage(): void {
    this.sendMessage('home');
  }

  /**
   * Send a volume change up
   * @param step An integer step up or dowm.
   */
  passVolumeMessage(step: number) {
    this.sendMessage('volume', { step });
  }

  /**
   * Send a idle message
   * @param idleTime How long the system waited before seunding this message in
   *                 milliseconds
   */
  passIdleMessage(idleTime: number) {
    this.sendMessage('idle', { idleTime });
  }

  /**
   * Sends a message indicating activity occured
   * @param type a string indicating the event type of the activity
   */
  passActivityMessage(type: string) {
    this.sendMessage('activity', { type });
  }
}
