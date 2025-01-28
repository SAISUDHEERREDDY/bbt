import { Pipe, PipeTransform } from '@angular/core';
import { Track } from './content';

@Pipe({
  name: 'hasTracks'
})
export class HasTracksPipe implements PipeTransform {
  /**
   *
   * @param content Determines if the content has tracks
   * @returns True if there are subtitle tracks otherwise false
   */
  transform(content: { tracks?: Array<Track> }): boolean {
    // Handle empty cases
    if (
      !content ||
      !content.tracks ||
      !(Symbol.iterator in Object(content.tracks))
    ) {
      return false;
    }

    // Return true if any tracks are captions
    for (const e of content.tracks) {
      if (e.kind === 'captions') return true;
    }

    return false; // Return false if there are no captions
  }
}
