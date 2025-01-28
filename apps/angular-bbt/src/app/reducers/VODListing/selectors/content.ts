// The selectors for this feature are sufficiently varied and complex that
// they have been broken into multiple files.
// Selectors for selecting pieces of an individual piece of content,
// particularly the piece of content store on state go here

import { createSelector } from '@ngrx/store';
import { contentListing } from './listing';
import { PresentationFile } from '../../../bbtcommon/content';
import { Video } from '../../../content-model';

/**
 * Selects the object containing both the content and the params to acquire it.
 */
export const contentMeta = createSelector(
  contentListing,
  s => s?.selectedContent
);

export const contentParams = createSelector(contentMeta, s => s?.params);

/**
 * Selects the content that is currently considered selected
 */
export const selectedContent = createSelector(contentMeta, x => x?.selected);

/**
 * Selects the files (or file in an array) from presentations and videos
 */
export const contentFiles = createSelector(selectedContent, x => {
  if (x?.type === 'Presentation') {
    return (x as any)?.items as PresentationFile[];
  } else if (x?.type === 'Video') {
    const video = x as Video;
    console.log("video",video)
    // Make the video conform to a presentation file format
    const arr: PresentationFile[] = [
      {
        filePath: video.filePath,
        type: 'Video',
        iconType: video.iconType,
        customIcon: video.customIcon,
        tracks: video.tracks != null ? [...video.tracks] : []
      }
    ];
    console.log("arr", arr)
    return arr;
  } else {
    return null;
  }
});

/**
 * Selects users logged in for the current content.
 */
export const joinedUsers = createSelector(contentMeta, x => x.users);

// Presentation State
/**
 * Selects the current index of a presentation file.
 */
export const currentPresentationIndex = createSelector(
  contentMeta,
  s => s?.presentationIndex
);

/**
 * Selects the current file from a presentation or video
 */
export const currentFile = createSelector(
  contentFiles,
  currentPresentationIndex,
  (files: PresentationFile[], index: number) => {
    const safeIndex = index ? index : 0; // default falsy values to 0
    if (files.length <= safeIndex) {
      throw new Error('Tried to select files out of range');
    }

    return files[safeIndex];
  }
);
