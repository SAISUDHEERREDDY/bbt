import { Track } from '../bbtcommon/content';
import { Content } from './content';

export interface Video extends Content {
  // pifId: number;
  filePath: string;
  /**
   * The length of the video in seconds
   */
  duration: number;
  tracks: Track[];
}
