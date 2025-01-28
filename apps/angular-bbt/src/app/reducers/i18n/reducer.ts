import { Action, createReducer, on } from '@ngrx/store';
import { initialI18nState } from './initial';
import * as actions from './actions';
import { I18nState } from './state';

const i18nReducer = createReducer(
  initialI18nState,
  on(actions.setGlobalLanguage, (state, { code, label }) => ({
    ...state,
    global: { code, label }
  }))
);

export function reducer(state: I18nState | undefined, action: Action) {
  return i18nReducer(state, action);
}
