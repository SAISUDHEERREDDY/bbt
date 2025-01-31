import { TranslationMappingObject } from '../i18n/lang.types';

/**
 * The base content type MediaTraining content derive from
 */
export interface Content {
  /**
   * The itemId of the item in the lms system used in the HSMA to uniquely
   * identify content
   */
  itemId: number;

  /**
   * A human readable name for content
   */
  title: string;

  /**
   * All the translations for this piece of content
   */
  titles?: TranslationMappingObject;

  /**
   * The display order of the content
   */
  displayOrder: number;

  /**
   * A human readable description of the content without bound lenth
   */
  description: string;

  /**
   * All the translations for this piece of content's description
   */
  descriptions: TranslationMappingObject;

  /**
   * The local path to the custom icon
   */
  customIcon?: string;
  /**
   * The type of the icon
   */
  iconType: 'custom' | 'default';

  /**
   * The type of the content as a string
   */
  type: 'Video' | 'Presentation' | 'Image' | 'Folder' | 'Stream' | 'Html';
}
