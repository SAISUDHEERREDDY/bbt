import { TranslationMappingObject } from '../i18n/lang.types';
import { Category } from './category';
import { Folder } from './folder';
import { Presentation } from './presentation';
import { Video } from './video';

/**
 * Captures the commonalities between types that have
 * menu items
 */
export interface MenuItemCollection {
  categories?: any;
  id: number;
  name: string;
  names?: TranslationMappingObject;
  breadcrumbs?: Array<Category | Folder>;
  menuItems: Array<Video | Presentation | Folder>;
}
