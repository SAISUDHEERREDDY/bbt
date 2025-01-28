import { createFeatureSelector, createSelector } from '@ngrx/store';
import { liveFeatureKey, LiveState } from './live.reducer';
import { ApplicationState } from '../index';

export const currentLive = createFeatureSelector<ApplicationState, LiveState>(
  liveFeatureKey
);

export const currentChannels = createSelector(
  currentLive,
  (state: LiveState) => {
    return state ? state.currentChannels : null;
  }
);

export const channels = createSelector(currentChannels, state =>
  state ? state.channels : null
);

export const activeChannel = createSelector(currentLive, state =>
  state.activeChannel ? state.activeChannel : null
);

export const activeProgram = createSelector(currentLive, state =>
  state.activeProgram ? state.activeProgram : null
);

export const nextOrCurrentProgramOnChannel = createSelector(
  activeChannel,
  state => {
    const now = new Date(Date.now());
    return state?.event?.reduce((a, c) =>
      a.startTime > c.startTime && c.startTime >= now ? c : a
    );
  }
);

export const safePreviewChannel = createSelector(
  currentLive,
  state => state?.previewChannel ?? state?.activeChannel
);
export const safePreviewProgram = createSelector(
  currentLive,
  nextOrCurrentProgramOnChannel,
  (live, next) => live?.previewProgram ?? live?.activeProgram ?? next
);

export const isChannelError = createSelector(
  currentLive,
  state => state?.channelsError
);
