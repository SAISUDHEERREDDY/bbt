import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import {
  catchError,
  concatMap,
  delay,
  map,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import {
  LiveActionTypes,
  LiveActions,
  ReceiveChannels,
  ActivateChannel,
  ActivateProgram,
  EndProgram,
  receiveChannelsError,
  setPreview
} from './live.actions';
import { Channel, ChannelEvent, LiveService } from '../../live/live.service';
import { select, Store } from '@ngrx/store';
import { EMPTY, of } from 'rxjs';
import { isEqual } from 'lodash';
import {
  activeChannel,
  activeProgram,
  safePreviewProgram
} from './live.selectors';
import { ApplicationState } from '../index';

const minute = 60 * 1000;

@Injectable()
export class LiveEffects {
  readonly HOUR = 60 * 60 * 1000;
  readonly THREE_HOURS = 3 * this.HOUR;

  constructor(
    private actions$: Actions<LiveActions>,
    private store: Store<ApplicationState>,
    private liveService: LiveService
  ) {}

  loadChannels$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveActionTypes.RequestChannels),
      concatMap(({ payload }) => {
        const twelveHours = 12 * 60 * minute;
        const now = Date.now();
        // Default min and max in the event that they were not sent
        const min = payload?.start ?? new Date(now - twelveHours);
        const max = payload?.end ?? new Date(min.valueOf() + twelveHours * 2);

        return this.liveService.getChannels(min, max).pipe(
          map(response => new ReceiveChannels({ channels: response })),
          catchError(() => {
            return of(receiveChannelsError());
          })
        );
      })
    )
  );

  defaultChannel$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LiveActionTypes.ReceiveChannels),
        concatMap(action =>
          of(action).pipe(
            withLatestFrom(this.store.pipe(select(activeChannel)))
          )
        ),
        map(([{ payload }, active]) => {
          if (
            payload &&
            payload.channels &&
            payload.channels.length > 0 &&
            !active
          ) {
            return this.store.dispatch(
              new ActivateChannel({
                channel: payload.channels[0]
              })
            );
          }

          return EMPTY;
        })
      ),
    { dispatch: false }
  );

  defaultEvent$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LiveActionTypes.ActivateChannel, LiveActionTypes.EndProgram),
        concatMap(action =>
          of(action).pipe(
            withLatestFrom(this.store.pipe(select(activeProgram)))
          )
        ),
        switchMap(([action, active]) => {
          const payload = action.payload;
          const newChannel =
            !payload || !payload.channel ? null : payload.channel;

          // If activating no channel and event isn't already null update it as well
          if (!newChannel && active) {
            return of(new ActivateProgram({ program: null }));
          }

          const program =
            this.liveService.findCurrentEventFromChannel(newChannel);

          if (!isEqual(program, active)) {
            // activate program AND continue to check if you need to schedule things
            this.store.dispatch(
              new ActivateProgram({
                program
              })
            );
          }

          // Schedule next program if there isn't one now
          if (program === null) {
            const next = this.findNextEventFromChannel(newChannel);
            if (next !== null) {
              return of(new ActivateProgram({ program: next })).pipe(
                delay(next.startTime)
              );
            }
          }

          return of(null); // return null if there is nothing else to do
        }),
        tap(x => {
          if (x !== null) {
            this.store.dispatch(x);
          }
        })
      ),
    { dispatch: false }
  );

  /**
   * Make sure correct channel is set and either setup the next event activation
   * or terminate the current one.
   */
  onEventActivation$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LiveActionTypes.ActivateProgram),
        concatMap(action =>
          of(action).pipe(
            withLatestFrom(this.store.pipe(select(activeChannel)))
          )
        ),
        switchMap(([action, channel]) => {
          if (action === null) {
            // Find the next event and wait to activate it
            // Wait until end and dispatch new event
            const next = this.findNextEventFromChannel(channel);
            if (next === null) {
              return of(null);
            } else {
              return of(new ActivateProgram({ program: next })).pipe(
                delay(next.startTime)
              );
            }
          } else if (action && action.payload && action.payload.program) {
            return of(
              new EndProgram({
                channel,
                program: action.payload.program
              })
            ).pipe(delay(action.payload.program.endTime));
          } else {
            // No program in payload and not null on purpose
            return of(null);
          }
        }),
        tap(x => {
          if (x !== null) {
            this.store.dispatch(x);
          }
        })
      ),
    { dispatch: false }
  );

  /**
   * Find the next event from the current channel.
   * @param channel The channel to look for the next event in.
   * @param currentTime The start to start look at. Defaults to now
   * @returns the next event to occur from the channel or null if no event
   * occurs in the future
   */
  findNextEventFromChannel(
    channel: Channel,
    currentTime = new Date()
  ): ChannelEvent {
    const currentStart = currentTime.valueOf();
    const now = Date.now();
    const bound =
      this.floorNearestHalfHour().valueOf() - now + this.THREE_HOURS - 1;
    let lowestDifference: number = Number.MAX_VALUE;
    let candidate: ChannelEvent = null;

    for (const event of channel.event) {
      const start = event.startTime.valueOf();
      const difference = start - currentStart;
      if (
        start > currentStart && // it isn't past already
        difference < lowestDifference && // and it is sooner that current candidate
        start - now <= bound
      ) {
        lowestDifference = difference;
        candidate = event;
      }
    }
    return candidate;
  }

  /**
   * Strip time off to the nearst half hour
   * @param date
   * @returns A date to the nearest half hour
   */
  private floorNearestHalfHour(date: Date = new Date()) {
    return new Date(date.valueOf() - (date.valueOf() % (this.HOUR / 2)));
  }

  /**
   * Find the next event from the current channel.
   * @param channel The channel to look for the next event in.
   * @param currentTime The start to start look at. Defaults to now
   * @returns the next event to occur from the channel or null if no event
   * occurs in the future
   */
  findPreviousEventFromChannel(
    channel: Channel,
    currentTime = new Date()
  ): ChannelEvent {
    const currentStart = currentTime.valueOf();
    const nearestHalfHour = this.floorNearestHalfHour().valueOf();
    let lowestDifference: number = Number.MAX_VALUE;
    let candidate: ChannelEvent = null;

    for (const event of channel.event) {
      const start = event.startTime.valueOf();
      const difference = currentStart - start;
      if (
        nearestHalfHour <= start && // it isn't past already
        start < currentStart && // it is earlier than the current start
        difference < lowestDifference // and it is sooner that current candidate
      ) {
        lowestDifference = difference;
        candidate = event;
      }
    }

    return candidate;
  }

  previewNext$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LiveActionTypes.FindNextPreviewInChannel),
        concatMap(action =>
          of(action).pipe(
            withLatestFrom(this.store.pipe(select(activeChannel)))
          )
        ),
        concatMap(([_, channel]) =>
          of(channel).pipe(
            withLatestFrom(this.store.pipe(select(safePreviewProgram)))
          )
        ),
        map(([channel, program]) => {
          const next = this.findNextEventFromChannel(
            channel,
            program.startTime
          );
          if (next) {
            this.store.dispatch(setPreview({ channel, program: next }));
          }
        })
      ),
    { dispatch: false }
  );

  previewPrevious$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LiveActionTypes.FindPreviousPreviewInChannel),
        concatMap(action =>
          of(action).pipe(
            withLatestFrom(this.store.pipe(select(activeChannel)))
          )
        ),
        concatMap(([_, channel]) =>
          of(channel).pipe(
            withLatestFrom(this.store.pipe(select(safePreviewProgram)))
          )
        ),
        map(([channel, program]) => {
          const next = this.findPreviousEventFromChannel(
            channel,
            program.startTime
          );
          if (next) {
            this.store.dispatch(setPreview({ channel, program: next }));
          }
        })
      ),
    { dispatch: false }
  );
}
