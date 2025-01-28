import { ActivatedRouteSnapshot } from '@angular/router';
import { RequestVODPageAction } from '../reducers/VODListing/action';
import { Observable } from 'rxjs';
import { LoginComponent } from '../bbtcommon/login/login.component';
import { filter, switchMap, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

export class ContentAwareGuard {
  constructor(protected dialog: MatDialog) {}

  protected static getListParams(route: ActivatedRouteSnapshot) {
    const params = {
      // Params to make the list call with
      category: decodeURI(route.paramMap.get('category'))
    };

    return {
      ...params,
      params: new RequestVODPageAction(
        params.category === 'root' ? '' : params.category
      )
    };
  }

  protected modalUntilCodeIsRight(
    predicate: (code) => Observable<boolean>
  ): Observable<boolean> {
    const modal = this.dialog.open(LoginComponent, {
      disableClose: true
    });

    return modal.componentInstance.code.pipe(
      switchMap(predicate), // Request authentication
      filter(x => x), // Filter out any falsy request
      tap(x => {
        // Close the modal if successful
        if (x) {
          modal.close();
        }
      })
    );
  }
}
