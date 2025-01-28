import { VODSelectedContent } from './VODSelectedContent';
import { VODMenu } from '../../content-model/VODMenu';
import { Category } from '../../content-model/category';
import { CategoryCollection } from '../../content-model/category-collection';

export interface VODListingState extends CategoryCollection {
  /**
   * The selected content is the content that is selected for display
   * (in any context)
   */
  selectedContent: VODSelectedContent;

  /**
   * The page is the current level of content listing you are on
   */
  page: VODMenu;

  /**
   * The categories to be listed
   */
  categories: Category[];
  categoriesState: 'loading' | 'error' | 'loaded' | undefined;
}
