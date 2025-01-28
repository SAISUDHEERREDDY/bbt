import { GeneralAction } from '../../GeneralAction.class';
import { VODListingTrigger } from './VODListingTrigger.enum';
import { Identifiable } from '../../../bbtcommon/Identifiable';
import { createAction, props } from '@ngrx/store';
import { Video, Presentation, Folder } from '../../../content-model';

// USER ACTIONS
export class LoginUserAction extends GeneralAction<
  VODListingTrigger,
  Identifiable
> {
  constructor(id: number) {
    super(VODListingTrigger.LoginUser, { id });
  }
}

export class LogoutUserAction extends GeneralAction<
  VODListingTrigger,
  Identifiable
> {
  constructor(id: number) {
    super(VODListingTrigger.LogoutUser, { id });
  }
}

export class LogoutAllUsersAction extends GeneralAction<
  VODListingTrigger,
  null
> {
  constructor() {
    super(VODListingTrigger.LogoutUser);
  }
}

// Playback Actions
export const setPresentationIndex = createAction(
  VODListingTrigger.SetPresentationIndex,
  props<{ index: number }>()
);

export const shiftPresentationIndex = createAction(
  VODListingTrigger.ShiftPresentationIndex,
  props<{ shift: 'first' | 'last' | number }>()
);

export const requestVODContent = createAction(
  VODListingTrigger.RequestContent,
  props<{ itemId: number; contentType: 'content' | 'local' }>()
);

export const selectContent = createAction(
  VODListingTrigger.SelectContent,
  props<{ content: Video | Presentation | Folder }>()
);
