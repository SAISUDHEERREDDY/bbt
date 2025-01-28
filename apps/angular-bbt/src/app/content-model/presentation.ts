import { Content } from './content';
import { Video } from './video';
import { Image } from './image';

export interface Presentation extends Content {
  type: 'Presentation';
  items: Array<Video | Image>;
}

