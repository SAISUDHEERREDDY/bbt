import { createAction, props } from '@ngrx/store';
import { SwitchableFeature } from '../../bbtcommon/SwitchableFeatures';
import { Features } from './features.interface';

const tag = '[Feature Switch]';
export const setFeatureSwitch = createAction(
  `${tag} Set Feature Switch`,
  props<{ feature: SwitchableFeature; setting: boolean }>()
);

export const initializeFeatures = createAction(
  `${tag} Initialize Feature Switches`,
  props<{ initialFeatures: Features }>()
);
