import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { OnDemandContentService } from '../content-model/on-demand-content.service';
import { MatDialog } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { ApplicationState } from '../reducers';
import { Observable, of } from 'rxjs';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';
import { ContentAwareGuard } from './ContentAwareGuard';
import {
  contentParams,
  selectedContent
} from '../reducers/VODListing/selectors';
import { Presentation, Video } from '../content-model';
import { requestVODContent } from '../reducers/VODListing/actions/content';

@Injectable()
export class ContentResolver
  extends ContentAwareGuard
  implements Resolve<Presentation | Video>, CanActivate
{
  constructor(
    private api: OnDemandContentService,
    dialog: MatDialog,
    private store: Store<ApplicationState>
  ) {
    super(dialog);
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const { itemId, contentType } = this.readParams(route);
    return this.fetchContent(itemId, contentType).pipe(map(x => !!x));
  }

  // private getContent(
  //   route: ActivatedRouteSnapshot
  // ): Observable<ContentPresentation | VideoContent | ContentDirectory> {
  //   const action = ContentAwareGuard.getContentParams(route);
  //   return this.store.pipe(
  //     select(contentMeta),
  //     tap(x => {
  //       const itemId = Number.parseInt(x.params.content, 10);
  //       const contentType = Number.parseInt(route.queryParams.);
  //       this.store.dispatch({itemId, contentType: 'content'});
  //     }),
  //     filter(x => Boolean(x) && Boolean(x.selected)),
  //     map(x => x.selected),
  //     first()
  //   );
  // }

  /**
   * Requests that content be loaded and awaits until content matching the
   * requested content is avaiable.
   */
  private fetchContent(
    itemId: number,
    contentType: 'content' | 'local'
  ): Observable<Video | Presentation> {
    return this.store.pipe(
      select(contentParams),
      tap(params => {
        // If anything is out of sync request new content payload
        if (itemId !== params?.itemId || contentType !== params?.contentType) {
          this.store.dispatch(requestVODContent({ itemId, contentType }));
        }
      }),
      // Watch for the requested content to come in
      switchMap(() => {
        const obs: Observable<Video | Presentation> = this.store.pipe(
          select(selectedContent)
        ) as unknown as Observable<Video | Presentation>;
        return obs;
      }),
      filter(content => {
        if (!content) {
          return false;
        }
        // Make sure this is the content we were looking for
        const type = this.api.isContentLocal(content);
        return (
          (content as Video | Presentation).itemId === itemId &&
          type === contentType
        );
      }),
      first()
    );
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Presentation | Video> {
    const { itemId, contentType } = this.readParams(route);
    return this.fetchContent(itemId, contentType);
  }

  /**
   * Provides a helper function that let you read and validate the parameters
   */
  private readParams(route: ActivatedRouteSnapshot): {
    itemId: number;
    contentType: 'content' | 'local';
  } {
    const itemId = Number.parseInt(route.paramMap.get('itemId'), 10);
    const contentType = route.paramMap.get('type');

    if (contentType !== 'content' && contentType !== 'local') {
      throw new Error(
        `Tried to navigate with "type" param of "${contentType}".` +
          ` Acceptable values are "content" and "local"`
      );
    }

    return { itemId, contentType: contentType as 'content' | 'local' };
  }
}
