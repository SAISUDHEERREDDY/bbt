import {
  ActivateChannel,
  ActivateProgram,
  LiveActions,
  LiveActionTypes,
  ReceiveChannels,
  RequestChannels
} from './live.actions';
import { Channel, ChannelEvent } from '../../live/live.service';
import { createReducer, on } from '@ngrx/store';
import * as liveActions from './live.actions';

export const liveFeatureKey = 'live';

export interface LiveState {
  // Channels
  currentChannels: {
    /**
     * An ISO 8601 limited subset string parsable by Date
     */
    rangeEnd: string;
    channels: { [id: string]: Channel };
  };
  /**
   * The channel that should be playing
   */
  activeChannel: Channel;
  previewChannel: Channel;

  // Program
  /**
   * The currently playing program
   */
  activeProgram: ChannelEvent;
  previewProgram: ChannelEvent;
  channelsError: boolean;
}

export const initialState: LiveState = {
  // Channels
  currentChannels: {
    rangeEnd: null,
    channels: null
  },
  activeChannel: null,
  previewChannel: null,

  // Program
  activeProgram: null,
  previewProgram: null,

  channelsError: false
};

export const liveReducer = createReducer(
  initialState,
  on(liveActions.setPreview, (state, action) => ({
    ...state,
    previewChannel: action.channel,
    previewProgram: action.program
  })),
  on(liveActions.clearPreview, state => ({
    ...state,
    previewChannel: null,
    previewProgram: null
  })),
  on(liveActions.receiveChannelsError, state => ({
    ...state,
    channelsError: true
  })),
  on(liveActions.clearAllLiveData, () => initialState)
);

export function reducer(state = initialState, action: LiveActions): LiveState {
  switch (action.type) {
    case LiveActionTypes.EndProgram:
      return {
        ...state,
        activeProgram: null
      };
    case LiveActionTypes.ActivateProgram:
      const activeProgram = (action as ActivateProgram).payload.program;
      return {
        ...state,
        activeProgram: {
          ...activeProgram,
          channel: null,
          channelNumber:
            activeProgram && activeProgram.channel
              ? activeProgram.channel.number
              : null
        } as ChannelEvent
      };
    case LiveActionTypes.ActivateChannel:
      const activeChannel = (action as ActivateChannel).payload.channel;
      return {
        ...state,
        previewProgram: null, // null out existing preview
        activeChannel: {
          ...activeChannel,
          event: activeChannel.event.map(x => ({
            ...x,
            channel: null,
            channelNumber: x.channel ? x.channel.number : null
          }))
        }
      };
    case LiveActionTypes.ReceiveChannels:
      const response = action as ReceiveChannels;
      const channels = response?.payload?.channels ?? [];
      const mapObj = {};

      // Index by number
      for (const channel of channels) {
        mapObj[channel.number] = {
          ...channel,
          event: channel.event.map(x => ({
            ...x,
            channel: null,
            channelNumber: channel ? channel.number : null
          }))
        };
      }

      return {
        ...state,
        currentChannels: {
          ...state.currentChannels,
          channels: mapObj
        }
      };
    case LiveActionTypes.RequestChannels:
      const { payload } = action as RequestChannels;
      // Parse current end date
      const currentEnd =
        state && state.currentChannels
          ? new Date(state.currentChannels.rangeEnd)
          : null;

      if (!payload || (currentEnd && payload.end < currentEnd)) {
        return { ...state, channelsError: false };
      }

      return {
        ...state,
        channelsError: false,
        currentChannels: {
          rangeEnd: action?.payload?.end?.toISOString(),
          channels: null
        }
      };

    default:
      return liveReducer(state, action);
  }
}
