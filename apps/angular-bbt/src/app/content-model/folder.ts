import { MenuItemCollection } from './menu-item-collection';

/**
 * Common interface to describe all the fields Base folder and RawFolder share.
 * This should not be directly used.
 */
export interface BaseFolder extends MenuItemCollection {
  /**
   * The foler id
   * notably not an itemId
   */
  id: number;

  /**
   * The human readble name of the folder
   */
  name: string;

  /**
   * A potentially lengthy description of the folder
   */
  description: string;

  /**
   * The type of the icon
   */
  iconType: 'custom' | 'default';

  /**
   * The color the folder was assigned as a hex string
   */
  color: string;

  /**
   * Determines if a passkey is set on a folder
   */
  passKey: boolean;
}

/**
 * Folders as they come from the server
 */
export interface RawFolder extends BaseFolder {
  /**
   * Raw folders feature an overly complex type
   * that contains their nesting level
   */
  type: 'Folder_L1' | 'Folder_L2';
}

/**
 * Folders as they are expected to be in the application
 */
export interface Folder extends BaseFolder {
  /**
   * Process folders simply the folder type to just folder
   */
  type: 'Folder';
}
