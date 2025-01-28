import {
  ActionReducerMap,
  createFeatureSelector,
  createSelector
} from '@ngrx/store';
import { PseudoFullscreenState } from './pseudoFullscreen/state';
import { pseudoFullscreenReducer } from './pseudoFullscreen/reducer';
import { VODListingState } from './VODListing/state';
import { vodListingReducer } from './VODListing/reducer';
import { parkingInfoReducer } from './parkingInfo/reducer';
import { ParkingInfoState } from './parkingInfo/state';
import * as live from './live/live.reducer';
import { reducer as liveReducer } from './live/live.reducer';
import { liveFeatureKey } from './live/live.reducer';
import * as i18n from './i18n/reducer';
import { I18nState } from './i18n/state';
import { IdleMessage } from './idleMessage/idle-message.interface';
import { idleMessageStateKey } from './idleMessage/idle-message-key';
import { idleMessageReducer } from './idleMessage/idle-message.reducer';
import { Features } from './features/features.interface';
import { featuresReducer } from './features/features.reducer';
import { featureSwitchKey } from './features/features.key';

export interface ApplicationState {
  pseudoFullscreen?: PseudoFullscreenState;
  VODListing?: VODListingState;
  parkingInfo?: ParkingInfoState;
  [idleMessageStateKey]?: IdleMessage;
  [liveFeatureKey]?: live.LiveState;
  i18n?: I18nState;
  [featureSwitchKey]: Features;
}

export const reducers: ActionReducerMap<ApplicationState> = {
  pseudoFullscreen: pseudoFullscreenReducer,
  VODListing: vodListingReducer,
  parkingInfo: parkingInfoReducer,
  live: liveReducer,
  i18n: i18n.reducer,
  [idleMessageStateKey]: idleMessageReducer,
  [featureSwitchKey]: featuresReducer
};
export const selectPseudoFullscreen = createFeatureSelector<
  ApplicationState,
  PseudoFullscreenState
>('pseudoFullscreen');
export const selectPseudoFullscreenEnabled = createSelector(
  selectPseudoFullscreen,
  (s: PseudoFullscreenState) => s.enabled
);
