import { Category } from './category';

/**
 * The primary interface expected to produce a VOD listing.
 */
export interface CategoryCollection {
  id: number;
  name: string;
  categories: Category[];
  requestedType?: 'Folder' | 'Category';
}
