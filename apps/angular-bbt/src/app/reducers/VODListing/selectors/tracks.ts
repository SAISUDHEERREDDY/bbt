// The selectors for this feature are sufficiently varied and complex that
// they have been broken into multiple files.
// Selectors for the specific concern of selecting text and audio tracks go
// here.

import {
  AudioTrack,
  CaptionTrack,
  ContentPresentation,
  Track,
  TrackTypes,
  VideoContent
} from '../../../bbtcommon/content';
import { isIterable } from '../../../bbtcommon/isIterable';
import { createSelector } from '@ngrx/store';
import { contentMeta, currentFile, selectedContent } from './content';
import { selectGlobalLanguage } from '../../i18n/selectors';
import { HlsAudioTrack } from '../../../vod/HlsAudioTrack';
import { Presentation, Video } from '../../../content-model';

// START HELPERS

/**
 * Gets the captions for a piece of content up front before playing.
 * @param tracks  The tracks to extract from (can be null)
 * @param type    The Track type to extract
 * @param caps    The set of captions to add to (defaults to new set)
 * @param ignore  A set of languages to ignore
 */
function extractFromTracks(
  tracks: Track[] | null,
  type: TrackTypes = null,
  caps = new Set<Track>(),
  ignore: Set<string> = new Set<string>()
) {
  if (!isIterable(tracks)) {
    return caps;
  }

  // Extract unique tracks
  for (const track of tracks) {
    // Check type if it is set
    if (type && type !== track.kind) {
      continue;
    }

    // Add if we don't already have this one.
    if (!ignore.has(track.srclang)) {
      caps.add(track);
      ignore.add(track.srclang);
    }
  }

  // Return results
  return caps;
}

/**
 * Creates a selector for a track type based on the current content
 * @param type    The Track type to extract
 * @param source  The object to extract tracks from
 */
function contentTrackExtractor(type: TrackTypes, source: Presentation | Video) {
  const handledLangs = new Set<string>();
  const caps = new Set<Track>();
  if (source?.type === 'Presentation') {
    // Extract the tracks from all video items
    for (const file of (source as Presentation).items) {
      if (file.type === 'Video') {
        extractFromTracks((file as Video).tracks, type, caps, handledLangs);
      }
    }
  } else if (source?.type === 'Video') {
    extractFromTracks((source as Video).tracks, type, caps, handledLangs);
  }

  return [...caps];
}

// END HELPERS

// START Content Level Selectors
/**
 * Extracts the audio tracks from the selected content including all files
 */
export const uniqueAudioFromSelectedContent = createSelector(
  selectedContent,
  s => contentTrackExtractor(TrackTypes.Audio, s as Video | Presentation)
);

/**
 * Extracts the captions from the selected content including all files
 */
export const uniqueCaptionsFromSelectedContent = createSelector(
  selectedContent,
  s => contentTrackExtractor(TrackTypes.Captions, s as Video | Presentation)
);
// END Content Level Selectors

// START Preference Level Selectors
/**
 * Selects the preferred caption language
 */
export const preferredCaption = createSelector(
  contentMeta,
  selectGlobalLanguage,
  (meta, global) => {
    // Return existing preferred if possible
    if (meta?.preferredCaption) {
      return meta.preferredCaption;
    }

    // Return global if available
    if (global) {
      return {
        kind: TrackTypes.Captions,
        label: global?.label,
        srclang: global?.code
      } as CaptionTrack;
    }

    // Return null if nothing available
    return null;
  }
);

/**
 * Selects the preferred audio language
 */
export const preferredAudio = createSelector(
  contentMeta,
  selectGlobalLanguage,
  (meta, global) => {
    // Return existing preferred if possible
    if (meta?.preferredAudio) {
      return meta.preferredAudio;
    }

    // Return global if available
    if (global) {
      return {
        kind: TrackTypes.Audio,
        label: global?.label,
        srclang: global?.code
      } as AudioTrack;
    }

    // Return null if nothing available
    return null;
  }
);
// END Preference Level Selectors

// START File level selectors
/**
 * Gets the audio tracks from the currently active file
 */
export const allFileAudioTracks = createSelector(contentMeta, file => {
  const tracks = file?.fileAudioTracks;

  if (!isIterable(tracks)) {
    return null;
  }

  return tracks;
});

/**
 * Takes available tracks and de-duplicates them by language code
 */
export const uniqueFileAudioTracks = createSelector(
  allFileAudioTracks,
  tracks => {
    if (!isIterable(tracks)) {
      return null;
    }

    const caps = new Set<HlsAudioTrack>();
    const ignore = new Set<string>();

    // Extract unique tracks
    for (const track of tracks) {
      // Add if we don't already have this one.
      if (!ignore.has(track.lang)) {
        caps.add(track);
        ignore.add(track.lang);
      }
    }

    return [...caps];
  }
);

/**
 * Gets the default audio track based on preference
 */
export const defaultFileAudioTrack = createSelector(
  contentMeta,
  uniqueFileAudioTracks,
  preferredAudio,
  (s, tracks, preferred) => {
    // If there are no tracks be done
    if (!isIterable(tracks) || !tracks.length) {
      return null;
    }

    // Default to preferred if at all possible
    for (const track of tracks) {
      // Set has preferred track to true if track matches it.
      if (track.lang === preferred.srclang) {
        return track;
      }
    }

    return tracks[0]; // Default to the first available track
  }
);

/**
 * Selects the fileAudioTrackId from state. This ID is expected to map to the
 * appropriate text track
 */
export const defaultFileAudioTrackId = createSelector(
  defaultFileAudioTrack,
  track => track?.id
);

/**
 * Gets the captions from the current active file
 */
export const fileCaptions = createSelector(currentFile, file =>
  file?.tracks?.length
    ? [...extractFromTracks(file.tracks, TrackTypes.Captions)]
    : []
);

/**
 * Gets the default caption language given the tracks presented
 */
export const defaultFileCaption = createSelector(
  fileCaptions,
  preferredCaption,
  (captions, preferred) => {
    if (!isIterable(captions)) {
      return null;
    }

    for (const caption of captions) {
      if (caption.srclang === preferred?.srclang) {
        return caption;
      }
    }

    // Default to nothing
    return null;
  }
);

/**
 * Selects just the language code from a default file caption
 */
export const defaultFileCaptionLanguage = createSelector(
  defaultFileCaption,
  s => s?.srclang
);
// END File level selectors
