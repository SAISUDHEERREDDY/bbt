import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot
} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { OnDemandContentService } from '../content-model/on-demand-content.service';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../reducers';
import { ContentAwareGuard } from './ContentAwareGuard';
import {
  receiveCategories,
  requestCategories
} from '../reducers/VODListing/action';

@Injectable()
export class DirectoryGuard extends ContentAwareGuard implements CanActivate {
  constructor(
    dialog: MatDialog,
    private api: OnDemandContentService,
    private store: Store<ApplicationState>
  ) {
    super(dialog);
  }

  /**
   * Responsibilities:
   * - Gets data for directory
   * @param route
   * @param state
   */
  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
    const categoryId = Number.parseInt(
      DirectoryGuard.getListParams(route)?.params?.payload?.category,
      10
    );

    return of(categoryId).pipe(
      tap(id =>
        this.store.dispatch(requestCategories({ id, collectionType: 'folder' }))
      ),
      map(() => true)
      // switchMap(id => this.api.getMenu(id, 'folder')),
      // map(collection => {
      //   this.store.dispatch(receiveCategories(collection));
      //   return true;
      // })
    );
  }
}
