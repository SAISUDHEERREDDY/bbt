import { AudioTrack, CaptionTrack } from '../../bbtcommon/content';
import { Folder, Presentation, Video } from '../../content-model';
import { HlsAudioTrack } from '../../vod/HlsAudioTrack';
import { VODContentParameters } from './VODPage';

export interface VODSelectedContent {
  params: VODContentParameters;
  selected: Video | Folder | Presentation;
  users?: number[];

  // Preferred Settings
  /**
   * The preferred audio language for a scoped area (like VOD presentations)
   */
  preferredAudio?: AudioTrack;

  /**
   * The preferred caption language for a scoped area (like VOD presentations)
   */
  preferredCaption?: CaptionTrack;

  // Playback Time Settings
  /**
   * Index of the file in a presentation that is currently selected
   */
  presentationIndex?: number;

  /**
   * Audio tracks for the file currently being played
   */
  fileAudioTracks?: HlsAudioTrack[];

  /**
   * A language code represented as a string
   */
  captionLanguageCode?: string;
}
