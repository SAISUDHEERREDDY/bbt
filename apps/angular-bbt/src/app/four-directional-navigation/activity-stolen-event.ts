import { INavigable } from './navigable';

export class ActivityStolenEvent {
  /**
   * @param original - The new truly active navigable
   * @param directChild - The child in this context now active
   */
  constructor(
    public readonly original: INavigable,
    public readonly directChild: INavigable = original
  ) {}

  chain(direct: INavigable) {
    return new ActivityStolenEvent(this.original, direct);
  }
}
