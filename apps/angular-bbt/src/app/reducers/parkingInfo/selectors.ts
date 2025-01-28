import { ApplicationState } from '../index';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ParkingInfoState } from './state';

export const selectParkingInfo = createFeatureSelector<
  ApplicationState,
  ParkingInfoState
>('parkingInfo');

export const parkingFiles = createSelector(
  selectParkingInfo,
  (state: ParkingInfoState) => (state && state.files ? state.files : [])
);
