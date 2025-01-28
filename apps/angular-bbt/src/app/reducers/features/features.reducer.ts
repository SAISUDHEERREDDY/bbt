import { Action, createReducer, on } from '@ngrx/store';
import { initializeFeatures, setFeatureSwitch } from './features.actions';
import { Features } from './features.interface';

export const featuresReducer = createReducer<Features, Action>(
  {},
  on(initializeFeatures, (state, action) => ({
    ...state,
    ...action.initialFeatures
  })),
  on(setFeatureSwitch, (state, action) => ({
    ...state,
    [action.feature]: action.setting
  }))
);
