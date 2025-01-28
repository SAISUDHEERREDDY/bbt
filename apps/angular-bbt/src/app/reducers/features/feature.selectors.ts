import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ApplicationState } from '..';
import { Features } from './features.interface';
import { featureSwitchKey } from './features.key';

export const featureSwitches = createFeatureSelector<
  ApplicationState,
  Features
>(featureSwitchKey);
