import { createSelector } from '@ngrx/store';
import { ApplicationState } from '../index';
import { I18nState } from './state';

export const selectI18n = ({ i18n }: ApplicationState) => i18n;
export const selectGlobalLanguage = createSelector(
  selectI18n,
  (s: I18nState) => s?.global
);
