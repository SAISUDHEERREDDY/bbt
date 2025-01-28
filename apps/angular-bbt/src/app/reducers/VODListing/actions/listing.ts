import { GeneralAction } from '../../GeneralAction.class';
import { VODListingTrigger } from './VODListingTrigger.enum';
import { VODPage, VODPageParameters } from '../VODPage';
import { VODMenu } from '../../../content-model/VODMenu';
import { createAction, props } from '@ngrx/store';
import { Category } from '../../../content-model/category';
import { CategoryCollection } from '../../../content-model/category-collection';

export class RequestVODPageAction extends GeneralAction<
  VODListingTrigger,
  VODPageParameters
> {
  constructor(category: string) {
    super(VODListingTrigger.RequestPage, { category });
  }
}

export class ReceiveVODPageAction extends GeneralAction<
  VODListingTrigger,
  VODMenu
> {
  constructor(payload: VODMenu) {
    super(VODListingTrigger.ReceivedPage, payload);
  }
}

export const requestCategories = createAction(
  VODListingTrigger.RequestCategories,
  props<{
    id?: number;
    collectionType: 'folder' | 'category';
  }>()
);

export const receiveCategories = createAction(
  VODListingTrigger.ReceivedCategories,
  props<CategoryCollection>()
);
