import { Content } from './content';

/**
 * The image type used in presentations
 */
export interface Image extends Content {
  type: 'Image';
  // pifId: number;
  filepath: string;
}
