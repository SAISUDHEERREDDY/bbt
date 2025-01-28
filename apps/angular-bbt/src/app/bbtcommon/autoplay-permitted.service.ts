import { Injectable, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
/**
 * A service to help users know if autoplay is permitted
 */
export class AutoplayPermittedService {
  private _isPermitted$ = new BehaviorSubject(false);
  readonly isPermitted$: Observable<boolean> = this._isPermitted$
    .asObservable()
    .pipe(distinctUntilChanged());

  constructor(rendererFactory: RendererFactory2) {
    const renderer = rendererFactory.createRenderer(null, null);
    const events = ['click', 'keydown', 'scroll'];
    let listeners = [];
    const switchToPermitted = () => {
      //destroy listeners
      listeners.forEach(x => x());
      listeners = null;

      this._isPermitted$.next(true);
    };

    listeners.push(
      ...events.map(e => renderer.listen('window', e, switchToPermitted))
    );
  }
}
