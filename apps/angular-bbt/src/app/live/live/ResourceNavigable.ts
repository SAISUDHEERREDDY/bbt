import { Observable, Subject } from 'rxjs';
import {
  INavigable,
  Navigable
} from '../../four-directional-navigation/navigable';
import { INavigableGroup } from '../../four-directional-navigation/navigable-group';

export class ResourceNavigable extends Navigable {
  private _left$ = new Subject();
  readonly left$ = this._left$.asObservable();
  private _right$ = new Subject();
  readonly right$ = this._right$.asObservable();

  constructor(
    private element: HTMLElement,
    private parent: INavigableGroup,
    public id: string,
    private activationCallback: () => void
  ) {
    super();
  }

  activate(): INavigable {
    this.element.focus({ preventScroll: true });
    this.activationCallback();
    return this;
  }

  deactivate(): INavigable {
    this.element.blur();
    return this;
  }

  down(): INavigable {
    return this.parent.down();
  }

  up(): INavigable {
    return this.parent.up();
  }

  // Does nothing on horizontal navigation attempts
  left(): INavigable {
    this._left$.next();
    return this.selfSelect();
  }

  right(): INavigable {
    this._right$.next();
    return this.selfSelect();
  }

  canActivate(): boolean {
    return true;
  }

  destroy() {
    this.activationCallback = null;
    super.destroy();
  }
}
