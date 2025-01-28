import { ReceiveVODPageAction, RequestVODPageAction } from './actions/listing';
import {
  LoginUserAction,
  LogoutAllUsersAction,
  LogoutUserAction,
  setPresentationIndex,
  shiftPresentationIndex
} from './actions/content';

export * from './actions/listing';
export * from './actions/content';
export * from './actions/tracks';

export type VODListingAction =
  | typeof setPresentationIndex
  | typeof shiftPresentationIndex
  | LoginUserAction
  | LogoutUserAction
  | LogoutAllUsersAction
  | RequestVODPageAction
  | ReceiveVODPageAction;
