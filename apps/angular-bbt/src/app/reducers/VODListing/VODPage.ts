import { ContentBreadcrumb } from '../../bbtcommon/content';
import { VODMenu } from '../../content-model/VODMenu';

export interface VODPageParameters {
  category: string;
}

export interface VODContentParameters {
  itemId: number;
  contentType: 'local' | 'content';
}

export interface VODPage {
  /**
   * The page params are the parameters used to get the page
   */
  params: VODPageParameters;
  contents: VODMenu;
  breadcrumbs?: ContentBreadcrumb[];
}
