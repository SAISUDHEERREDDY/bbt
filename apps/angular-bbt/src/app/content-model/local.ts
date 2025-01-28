import { Content } from './content';

export interface Local extends Content {
  duration: number;
  rating: string;
  filePath: string;
  size: number;
  order: number;
  uploadtime: string;
  pendingThumb?: string | ArrayBuffer;
  pendingFile?: File;
}
