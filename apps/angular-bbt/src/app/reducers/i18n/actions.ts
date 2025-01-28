import { createAction, props } from '@ngrx/store';
import { LanguagePair } from './state';

export const setGlobalLanguage = createAction(
  '[i18n] Set Global Language',
  props<LanguagePair>()
);
