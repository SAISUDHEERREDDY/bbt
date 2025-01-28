export interface IdleMessage {
  /**
   * True if you are crrently considered idle
   */
  isIdle: boolean;

  /**
   * Determines if the countdown is paused
   */
  isPaused: boolean;

  /**
   * Milliseconds after which to consider the system idle
   */
  idleAfter: number;
}
