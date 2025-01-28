import { Injectable } from '@angular/core';
import { Actions, createEffect, Effect, ofType } from '@ngrx/effects';
import {
  ParkingInfoTriggers,
  ReceivedParkingInfo,
  RequestParkingInfo
} from './action';
import {
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  tap
} from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ParkingInfoState } from './state';
import { CrossMessageService } from '../../bbtcommon/cross-message.service';
import { ApplicationState } from '..';
import { select, Store } from '@ngrx/store';
import { featureSwitches } from '../features/feature.selectors';
import { EMPTY } from 'rxjs';

@Injectable()
export class ParkingInfoEffects {
  @Effect()
  loadParkingInfo$ = this.actions$.pipe(
    ofType(ParkingInfoTriggers.Request),
    mergeMap(() =>
      this.http.get<ParkingInfoState>('video_player/parking_info')
    ),
    map(x => new ReceivedParkingInfo(x))
  );

  @Effect({ dispatch: false })
  idlenessPause$ = this.actions$.pipe(
    ofType(ParkingInfoTriggers.Pause),
    tap(() => this.crossMessageService?.expectIdle())
  );

  @Effect({ dispatch: false })
  idlenessResumes$ = this.actions$.pipe(
    ofType(ParkingInfoTriggers.Resume),
    tap(() => this.crossMessageService.cancelExpectIdle())
  );

  /**
   * Request info if parking channel feature is on
   */
  requestWhenFeatureSwitchTurnsOn$ = createEffect(
    () => {
      return this.store.pipe(
        select(featureSwitches),
        map(x => x.ParkingChannel),
        distinctUntilChanged(),
        filter(x => x),
        tap(() => {
          this.store.dispatch(new RequestParkingInfo());
        }),
        map(() => EMPTY)
      );
    },
    { dispatch: false }
  );

  constructor(
    private store: Store<ApplicationState>,
    private actions$: Actions,
    private http: HttpClient,
    private crossMessageService: CrossMessageService
  ) {}
}
