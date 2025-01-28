import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ApplicationState } from '..';
import { idleMessageStateKey } from './idle-message-key';
import { IdleMessage } from './idle-message.interface';

export const idleMessage = createFeatureSelector<ApplicationState, IdleMessage>(
  idleMessageStateKey
);

export const isIdle = createSelector(idleMessage, x => x?.isIdle);
export const isPaused = createSelector(idleMessage, x => x?.isPaused);
export const idleAfter = createSelector(idleMessage, x => x?.idleAfter);
