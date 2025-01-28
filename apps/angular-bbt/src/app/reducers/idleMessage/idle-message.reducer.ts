import { createReducer, on } from '@ngrx/store';
import {
  setActive,
  setIdling,
  pauseIdleCountdown,
  resumeIdleCountdown,
  setIdleAfter,
  idleDisabled
} from './idle-message.actions';

const defaultState = {
  isIdle: null,
  isPaused: false,
  idleAfter: null
};

export const idleMessageReducer = createReducer(
  defaultState,
  on(setIdleAfter, (state, action) => ({
    ...state,
    idleAfter: action.idleAfter
  })),
  on(setIdling, s => ({ ...s, isIdle: true })),
  on(setActive, s => ({ ...s, isIdle: false })),
  on(pauseIdleCountdown, s => ({ ...s, isPaused: true })),
  on(resumeIdleCountdown, s => ({ ...s, isPaused: false })),
  on(idleDisabled, () => defaultState)
);
