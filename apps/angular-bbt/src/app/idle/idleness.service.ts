import { Inject, Injectable, InjectionToken } from '@angular/core';
import {
  combineLatest,
  fromEvent,
  merge,
  Observable,
  Subject,
  timer
} from 'rxjs';
import {
  throttleTime,
  map,
  filter,
  debounce,
  shareReplay,
  first,
  startWith
} from 'rxjs/operators';
import { ApplicationState } from '../reducers';
import { select, Store } from '@ngrx/store';
import { selectParkingInfo } from '../reducers/parkingInfo/selectors';
import { ParkingInfoState } from '../reducers/parkingInfo/state';
import {
  PauseParkingInfo,
  ResumeParkingInfo
} from '../reducers/parkingInfo/action';
import {
  pauseIdleCountdown,
  resumeIdleCountdown
} from '../reducers/idleMessage/idle-message.actions';
import { FeatureSwitchesService } from '../bbtcommon/feature-switches.service';

// Times to adjust timeout settings
const throttleInputUpdate = 3 * 1000;

export const DOCUMENT = new InjectionToken<Document>('window#document', {
  providedIn: 'root',
  factory: () => window.document
});

@Injectable({
  providedIn: 'root'
})
export class IdlenessService {
  private _programmaticInteraction = new Subject();

  private readonly _interaction = merge(
    this._programmaticInteraction,
    fromEvent(this.document.body, 'click'),
    fromEvent(this.document.body, 'keypress'),
    fromEvent(this.document.body, 'scroll'),
    fromEvent(this.document.body, 'wheel')
  );

  /**
   * A convience observable exposing throttled interactions
   * shared amoungst observers.
   */
  public readonly interaction = this._interaction.pipe(
    startWith({ type: 'initialization' }),
    throttleTime(3000),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );

  /**
   * Records the time the last interaction occured reactively
   */
  public lastInteractionAt$ = this.interaction.pipe(
    map(() => new Date()),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );

  /**
   * Idle observable that emits when the idle status changes
   */
  public readonly parkingIdle: Observable<ParkingInfoState> = combineLatest([
    this.store.pipe(select(selectParkingInfo)),
    this.interaction
  ]).pipe(
    map(([parkingInfo]) => parkingInfo),
    // Filter out if screenTimeout is bad
    filter(x => !Number.isNaN(Number(x.screenTimeout))),
    debounce((x: ParkingInfoState) => timer(x.screenTimeout * 60 * 1000)),
    // Allow emit only if enabled and not paused
    filter(x => x.enabled && !x.paused)
  );

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private store: Store<ApplicationState>,
    private features: FeatureSwitchesService
  ) {}

  /**
   * To be called when some programmatic interaction that occurred that
   * removes that should cause the idleness shift to reset.
   */
  noteInteraction() {
    this._programmaticInteraction.next();
  }

  /**
   * Creates an observable that completes a certain amount of time after an
   * interaction. If this amount of time has already passed the observable
   * completes immediately.
   * @param millisecondsToWait      Time in millisecond to wait after interaction
   *                                before emitting
   */
  getIdlenessWaiter(millisecondsToWait) {
    return this.lastInteractionAt$.pipe(
      debounce(x => timer(millisecondsToWait - (x.valueOf() - Date.now()))),
      first()
    );
  }

  /**
   * Returns an observable that completes on the next interaction
   */
  waitForNextInteraction() {
    return this._interaction.pipe(first());
  }

  /**
   * Pauses the various timers
   */
  pause() {
    if (this.features.get('ParkingChannel')) {
      this.store.dispatch(new PauseParkingInfo());
    }

    if (this.features.get('IdleMessage')) {
      this.store.dispatch(pauseIdleCountdown());
    }
  }

  /**
   * Resumes the various timers
   */
  resume() {
    if (this.features.get('ParkingChannel')) {
      this.store.dispatch(new ResumeParkingInfo());
    }
    if (this.features.get('IdleMessage')) {
      this.store.dispatch(resumeIdleCountdown());
    }
  }
}
