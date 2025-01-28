import { Observable } from 'rxjs';
import { ActivityStolenEvent } from './activity-stolen-event';
import { INavigable } from './navigable';

export interface Activable {
  readonly onActivate: Observable<ActivityStolenEvent>;
  /**
   * The action to be taken when set to active. This is for side-effects only
   * for state manipulation use emitActivate
   */
  activate(): INavigable;

  /**
   * The actions to be taken when deactivated
   * @returns   The deactivated navigable
   */
  deactivate(): INavigable;

  /**
   * Emits an activation event through the onActivate observable
   * @param event
   */
  emitActivated(event: ActivityStolenEvent): void;

  /**
   * @returns  True if the navigable can be activated. Otherwise, false.
   */
  canActivate(): boolean;
}
