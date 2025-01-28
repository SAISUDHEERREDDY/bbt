import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { ApplicationState } from '..';
import { CrossMessageService } from '../../bbtcommon/cross-message.service';
import { FeatureSwitchesService } from '../../bbtcommon/feature-switches.service';
import { IdlenessService } from '../../idle/idleness.service';
import {
  idleDisabled,
  resumeIdleCountdown,
  setActive,
  setIdleAfter,
  setIdling
} from './idle-message.actions';
import { idleAfter, isIdle, isPaused } from './idle-message.selectors';

@Injectable()
export class IdleMessageEffects {
  /**
   * Emits when it is determined you are idle
   */
  readonly watchForIdleness$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setActive, resumeIdleCountdown), // Watch for becoming active
      switchMap(() => this.store.select(idleAfter)),
      // Wait until the idleTime is up
      switchMap(idleTime =>
        this.idlenessService
          .getIdlenessWaiter(idleTime)
          .pipe(map(() => idleTime))
      ),
      // Get additional params and stop if this doesn't make sense anymore
      withLatestFrom(this.store.select(isPaused), this.store.select(isIdle)),
      filter(([_idleAfter, isPaused, isIdle]) => !isPaused && !isIdle),
      map(([idleTime]) => {
        // Send message if you should
        if (this.featureSwitches.get('IdleMessage')) {
          this.crossMessageService.passIdleMessage(idleTime);
        }

        return setIdling(); // Set Idling Status
      })
    )
  );

  /**
   * Watchs when entering idle for events to go back to active
   */
  readonly waitForActivity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setIdling),
      // wait for an interaction
      switchMap(() => this.idlenessService.waitForNextInteraction()),
      map(() => setActive())
    )
  );

  /**
   * Updates the status when the timeout time changes.
   * This is meant to be the way the becomingActive$ and
   * watchForIdleness$ kick off their back and forth as well
   */
  readonly updateStatusWhenTimeoutChanges$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setIdleAfter),
      withLatestFrom(this.idlenessService.lastInteractionAt$),
      // Determine if we are idle now
      map(
        ([action, lastInteraction]) =>
          Date.now() - lastInteraction.valueOf() > action.idleAfter
      ),
      withLatestFrom(this.store.select(isIdle)),
      // Do nothing if updating would achieve nothing
      filter(
        ([newlyIdle, currentIdleStatus]) =>
          currentIdleStatus === null || newlyIdle !== currentIdleStatus
      ),
      map(([newlyIdle]) => (newlyIdle ? setIdling() : setActive()))
    )
  );

  /**
   * When the feature switch turns on set the idle info. Later this should set
   * up getting the idle after length
   */
  readonly requestIdleInfoWhenIdleSwitchesOn$ = createEffect(() =>
    this.featureSwitches.listenForFeatureChanges('IdleMessage').pipe(
      filter(x => x), // Continue only if the switch is true
      tap(x => console.log('Feature Switch from idle', x)),
      map(() => setIdleAfter({ idleAfter: 3 * 60 * 1000 }))
    )
  );

  /**
   * Disables idle when feature switch turns off and it is not already off
   */
  readonly switchOffIdle$ = createEffect(() =>
    this.featureSwitches.listenForFeatureChanges('IdleMessage').pipe(
      // Hooks the actions that might change the feature switch
      withLatestFrom(this.store.select(isIdle)),
      // Continue only if the switch is false and info is set
      filter(([isFeatureOn, isIdle]) => !isFeatureOn && isIdle !== null),
      map(() => idleDisabled())
    )
  );

  constructor(
    private actions$: Actions,
    private store: Store<ApplicationState>,
    private idlenessService: IdlenessService,
    private crossMessageService: CrossMessageService,
    private featureSwitches: FeatureSwitchesService
  ) {}
}
