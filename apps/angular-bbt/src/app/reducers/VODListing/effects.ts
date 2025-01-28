import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { OnDemandContentService } from '../../content-model/on-demand-content.service';
import {
  receiveCategories,
  requestCategories,
  requestVODContent,
  selectContent
} from './action';
import { map, retry, switchMap } from 'rxjs/operators';

@Injectable()
export class VODListingEffects {
  constructor(
    private actions$: Actions,
    private onDemandContentService: OnDemandContentService
  ) {}

  selectedItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(requestVODContent),
      switchMap(action => {
        return this.onDemandContentService
          .get(action.itemId, action.contentType)
          .pipe(map(content => selectContent({ content })));
      })
    )
  );

  categories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(requestCategories),
      switchMap(action =>
        this.onDemandContentService
          .getMenu(action.id, action.collectionType)
          .pipe(
            retry(3),
            map(x => receiveCategories(x))
          )
      )
    )
  );
}
