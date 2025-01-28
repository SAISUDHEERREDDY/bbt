import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ApplicationState } from '../reducers';
import { clearAllLiveData } from '../reducers/live/live.actions';

@Injectable({
  providedIn: 'root'
})
export class LiveExitGuard implements CanDeactivate<unknown> {
  constructor(private store: Store<ApplicationState>) {}

  canDeactivate(
    component: unknown,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    this.store.dispatch(clearAllLiveData());
    return true;
  }
}
