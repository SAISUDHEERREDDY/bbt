import { Action, createAction, props } from '@ngrx/store';
import { Channel, ChannelEvent } from '../../live/live.service';

export enum LiveActionTypes {
  RequestChannels = '[Live] Request Channels',
  ReceiveChannels = '[Live] Receive Channels',
  ActivateChannel = '[Live] Activate Channel',
  ActivateProgram = '[Live] Activate Program',
  EndProgram = '[Live] End Program',
  SetPreview = '[Live] Set Preview',
  ClearPreview = '[Live] Clear Preview',
  ReceiveChannelsError = '[Live] Receive Channels Error',
  ClearAll = '[Live] Clear All',
  FindNextPreviewInChannel = '[Live] Find Next Preview In Channel',
  FindPreviousPreviewInChannel = '[Live] Find Previous Preview In Channel',
  FailedToFindPreview = '[Live] Failed To Find Next Preview In Channel'
}

export class RequestChannels implements Action {
  readonly type = LiveActionTypes.RequestChannels;
  constructor(public payload: { start?: Date; end?: Date }) {}
}

export class ReceiveChannels implements Action {
  readonly type = LiveActionTypes.ReceiveChannels;
  constructor(public payload: { channels: Channel[] }) {}
}

export class ActivateChannel implements Action {
  readonly type = LiveActionTypes.ActivateChannel;
  constructor(public payload: { channel: Channel }) {}
}

export class ActivateProgram implements Action {
  readonly type = LiveActionTypes.ActivateProgram;
  constructor(public payload: { program: ChannelEvent }) {}
}

export class EndProgram implements Action {
  readonly type = LiveActionTypes.EndProgram;
  constructor(
    public payload: {
      channel: Channel;
      program: ChannelEvent;
    }
  ) {}
}

export const setPreview = createAction(
  LiveActionTypes.SetPreview,
  props<{
    channel: Channel;
    program: ChannelEvent;
  }>()
);

export const clearPreview = createAction(LiveActionTypes.ClearPreview);

export const receiveChannelsError = createAction(
  LiveActionTypes.ReceiveChannelsError
);

export const clearAllLiveData = createAction(LiveActionTypes.ClearAll);

export const failedToFindPreview = createAction(
  LiveActionTypes.FailedToFindPreview
);

export const findNextPreviewInChannel = createAction(
  LiveActionTypes.FindNextPreviewInChannel
);
export const findPreviousPreviewInChannel = createAction(
  LiveActionTypes.FindPreviousPreviewInChannel
);

export type LiveActions =
  | EndProgram
  | RequestChannels
  | ReceiveChannels
  | ActivateChannel
  | ActivateProgram;
