import { Observable, Subject } from 'rxjs';
import { ActivityStolenEvent } from './activity-stolen-event';
import { OrthogonalShifter } from './OrthogonalShifter';
import { Activable } from './Activable';

/**
 * The navigable interface should be implemented on components or in directives
 * that want to be navigated
 */
export interface INavigable extends OrthogonalShifter, Activable {
  readonly symbol: symbol;
  priority: number;
}

export abstract class Navigable implements INavigable {
  /**
   * Getter to provide observable access to emit activated
   */
  get onActivate(): Observable<ActivityStolenEvent> {
    return this._onActivate;
  }
  public readonly symbol = Symbol();

  private _onActivate = new Subject<ActivityStolenEvent>();

  priority: number = null;

  // OrthogonalShifter abstract passthroughs
  abstract up(): INavigable;
  abstract down(): INavigable;
  abstract left(): INavigable;
  abstract right(): INavigable;

  // Activable abstract passthroughs
  abstract activate(): INavigable;
  abstract deactivate(): INavigable;
  abstract canActivate(): boolean;

  protected selfSelect() {
    this.activate();

    return this;
  }

  /**
   * Emits an activation event through the onActivate observable
   * @param event
   */
  emitActivated(event: ActivityStolenEvent) {
    this._onActivate.next(event);
  }

  destroy() {
    this._onActivate.complete();
  }
}
