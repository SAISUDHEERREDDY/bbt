import { createAction, props } from '@ngrx/store';
import { VODListingTrigger } from './VODListingTrigger.enum';
import { HlsAudioTrack } from '../../../vod/HlsAudioTrack';
import { AudioTrack, CaptionTrack } from '../../../bbtcommon/content';

export const updateAudioTracks = createAction(
  VODListingTrigger.UpdateAudioTracks,
  props<{ tracks: HlsAudioTrack[] }>()
);

export const updateAudioTrack = createAction(
  VODListingTrigger.UpdateAudioTrack,
  props<{ id: number }>()
);

export const setPreferredAudio = createAction(
  VODListingTrigger.SetPreferredAudio,
  props<AudioTrack>()
);

export const setPreferredCaption = createAction(
  VODListingTrigger.SetPreferredCaption,
  props<CaptionTrack>()
);

export const setCaptionLanguage = createAction(
  VODListingTrigger.SetCaptionCode,
  props<{ code: string }>()
);
