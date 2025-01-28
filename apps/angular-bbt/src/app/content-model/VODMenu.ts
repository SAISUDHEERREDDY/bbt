import { Category } from './category';
import { CategoryCollection } from './category-collection';

/**
 * Describes the shape a VOD Menu will take. Based on the documentation at:
 * https://hughesmediasolutions.atlassian.net/wiki/spaces/MEDLOK/pages/1511161869/VOD+API#Get-Vod-Menu
 */
export interface VODMenu extends CategoryCollection {
  name: string;
  id: number;
  categories: Array<Category>;
}
