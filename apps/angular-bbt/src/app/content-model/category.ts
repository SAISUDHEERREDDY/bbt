import { MenuItemCollection } from './menu-item-collection';

/**
 * Describes a single category in a VOD Menu based on the docs at:
 * https://hughesmediasolutions.atlassian.net/wiki/spaces/MEDLOK/pages/1511161869/VOD+API#Get-Vod-Menu
 * notably quite a bit more data is returned, but lots of it is useless to this
 * application, so it is not part of the interface.
 */
export interface Category extends MenuItemCollection {
  /**
   * The categories' id
   */
  id: number;
  name: string;
  displayOrder?:number;
}
