import { Injectable } from '@angular/core';
import { INavigable } from './navigable';
import { ActivityStolenEvent } from './activity-stolen-event';
import { INavigableGroup } from './navigable-group';
import { fromEvent } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { IdlenessService } from '../idle/idleness.service';

@Injectable({
  providedIn: 'root'
})
export class ActiveService implements INavigableGroup {
  // INavigableGroup members
  symbol: symbol = Symbol();
  /**
   * Determines if the activity service is enabled
   */
  enabled = false;

  // disabled acts as an opposite to enabled and changes enabled approriately
  set disabled(val) {
    this.enabled = !val;
  }
  get disabled(): boolean {
    return !this.enabled;
  }

  onActivate = null;
  priority = null;
  // End INavigableGroup members

  subscriptionMap = new Map<symbol, INavigable>();

  isPaused = false;
  activeChild: INavigable;

  private activityStack: INavigable[] = [];

  set trulyActive(nav: INavigable) {
    if (nav === null) {
      throw new Error(
        'Attempted to set active navigable to null. Navigation aborted'
      );
    }

    // Handle empty case
    if (this.activityStack.length === 0) {
      this.activityStack.push(nav);
      return;
    }

    this.activityStack[this.activityStack.length - 1] = nav;
  }

  get trulyActive(): INavigable {
    if (this.activityStack.length === 0) {
      return null;
    }

    return this.activityStack[this.activityStack.length - 1];
  }

  constructor(private idle: IdlenessService) {
    const navKeys = new Set([
      'ArrowRight',
      'ArrowLeft',
      'ArrowUp',
      'ArrowDown'
    ]);

    fromEvent(window, 'keydown')
      .pipe(
        filter(() => !this.disabled), // Ignore event if disabled
        filter(() => !this.isPaused), // Ignore event if paused
        filter((x: KeyboardEvent) => navKeys.has(x.key.trim())),
        tap(event => event.preventDefault()),
        map(x => x.key.trim()),
        map((key: string): INavigable => {
          // Handle happy path
          if (this.trulyActive) {
            const deactivated = this.trulyActive.deactivate();
            let newlyActive = null;
            switch (key) {
              case 'ArrowRight':
                newlyActive = deactivated.right();
                break;
              case 'ArrowLeft':
                newlyActive = deactivated.left();
                break;
              case 'ArrowUp':
                newlyActive = deactivated.up();
                break;
              case 'ArrowDown':
                newlyActive = deactivated.down();
                break;
              default:
                throw new Error(
                  `Non-directional event ${key} sent to activity manipulator`
                );
            }

            return newlyActive && deactivated.symbol === newlyActive.symbol
              ? deactivated
              : newlyActive;
          }

          // Handle focus lost
          console.error('Lost focus', this);
        }),
        tap((activated: INavigable) => (this.trulyActive = activated)),
        tap(() => this.idle.noteInteraction())
      )
      .subscribe({
        error: console.error
      });
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  push(nav: INavigable) {
    this.activityStack.push(nav);
  }

  /**
   * Pushes the trapping nav to the activity stack and sets
   * the theif active
   * @param thief The newly active element
   */
  pushAndSteal(thief: INavigable) {
    this.trulyActive.deactivate();
    this.push(thief);
    thief.activate();
    thief.emitActivated(new ActivityStolenEvent(thief, thief));
  }

  pop(): INavigable {
    return this.activityStack.pop();
  }

  /**
   * Pops off the top level trap and activates the previous layer. Activates
   * selection from previous layer.
   */
  activatePrevious() {
    const previous = this.pop();
    previous.deactivate();
    this.trulyActive.activate();
    this.trulyActive.emitActivated(
      new ActivityStolenEvent(this.trulyActive, this.trulyActive)
    );
  }

  // INavigable group linear shifters
  next(): INavigable {
    throw new Error('next reached ActiveService without being handled');
  }

  previous(): INavigable {
    throw new Error('previous reached ActiveService without being handled');
  }

  // Tracking of children navigable
  registerNavigable(nav: INavigable): void {
    this.subscriptionMap[nav.symbol] = nav.onActivate.subscribe({
      next: stolen => {
        if (this.trulyActive?.symbol === stolen.original.symbol) {
          return; // Do nothing if this is already active.
        }

        this.trulyActive = stolen.original;
      }
    });
  }

  unregisterNavigable(nav: INavigable): void {
    this.subscriptionMap[nav.symbol].unsubscribe();
    this.subscriptionMap.delete(nav.symbol);
  }

  // INavigable group four directional shifters
  up(): INavigable {
    throw new Error('up reached ActiveService without being handled');
  }

  down(): INavigable {
    throw new Error('down reached ActiveService without being handled');
  }

  left(): INavigable {
    throw new Error('left reached ActiveService without being handled');
  }

  right(): INavigable {
    throw new Error('right reached ActiveService without being handled');
  }

  // Activity handling
  activate(): INavigable {
    return this.trulyActive.activate();
  }

  deactivate(): INavigable {
    return this.trulyActive.deactivate();
  }

  emitActivated(_event: ActivityStolenEvent): void {
    throw new Error('ActiveService should not be asked to steal activity');
  }

  canActivate(): boolean {
    return true;
  }
}
