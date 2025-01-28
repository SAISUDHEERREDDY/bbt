import { Injectable } from '@angular/core';
import { Actions, createEffect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ApplicationState } from '..';

@Injectable()
export class IdleMessageEffects {
  /**
   * Updates the status when the timeout time changes.
   * This is meant to be the way the becomingActive$ and
   * watchForIdleness$ kick off their back and forth as well
   */
  readonly updateStatusWhenTimeoutChanges$ = createEffect(() =>
    this.actions$.pipe()
  );

  constructor(
    private actions$: Actions,
    private store: Store<ApplicationState>
  ) {}
}
