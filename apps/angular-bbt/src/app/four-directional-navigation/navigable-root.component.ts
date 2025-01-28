import { ChangeDetectorRef, Component } from '@angular/core';
import { INavigable, Navigable } from './navigable';
import { Unsubscribable } from 'rxjs';
import { INavigableGroup } from './navigable-group';
import { ActiveService } from './active.service';
import { ActivityStolenEvent } from './activity-stolen-event';
import { PriorityMap } from './priority-map';

@Component({
  selector: 'bbt-navigable-root',
  template: '<ng-content></ng-content>'
})
export class NavigableRootComponent
  extends Navigable
  implements INavigableGroup
{
  // private trulyActive: INavigable = null;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private active: ActiveService
  ) {
    super();
  }

  protected get activeIndex(): number {
    return this._activeIndex;
  }

  get activeChild() {
    return this.children.getIndex(this.activeIndex) || null;
  }

  private childSubscriptions = new Map<Symbol, Unsubscribable>();
  protected readonly children = new PriorityMap<INavigable>();

  private _activeIndex: number = null;

  activate(): INavigable {
    if (!this.activeChild) {
      if (this.children && this.children.length) {
        this.children[0].activate();
        return this.activeChild;
      } else {
        return null;
      }
    }
    this.active.trulyActive = this.activeChild.activate();
    return this.active.trulyActive;
  }

  /**
   * The root is always activate and does nothing when deactivated
   */
  deactivate(): Navigable {
    return null;
  }

  // Delegated to active
  down(): INavigable {
    if (this.active.trulyActive === null) {
      return null;
    }

    this.active.trulyActive.down();
    return this.active.trulyActive;
  }

  left(): INavigable {
    if (this.active.trulyActive === null) {
      return null;
    }

    this.active.trulyActive.left();
    return this.active.trulyActive;
  }

  right(): INavigable {
    if (this.active.trulyActive === null) {
      return null;
    }

    this.active.trulyActive.right();
    return this.active.trulyActive;
  }

  up(): INavigable {
    if (this.active.trulyActive === null) {
      return null;
    }

    this.active.trulyActive.up();
    return this.active.trulyActive;
  }

  /**
   * Helper to set both properties at once
   * @param index
   */
  protected updateActive(index: number): INavigable {
    // Handle deactivation
    if (index === null) {
      this._activeIndex = null;
      return null;
    }

    // Update if index exists
    this._activeIndex = index;
    return this.activeChild;
  }

  /**
   * Shifter is a helper function that lets you move forwards or backwards,
   * dealing with underflow as it goes.
   * @param shifter
   */
  protected shift(shifter: number): INavigable {
    // If nothing is active
    if (this.activeIndex === -1 || this.activeIndex === null) {
      this.updateActive(this.activeIndex);
    }

    const oldIndex = this.activeIndex;
    this.activeChild.deactivate();

    // Safely update index
    const lastIndex = this.children.length - 1;
    const newIndex = oldIndex + shifter;
    if (newIndex < 0) {
      this.updateActive(this._activeIndex);
    } else if (newIndex > lastIndex) {
      this.updateActive(this._activeIndex);
    } else {
      this.updateActive(newIndex);
    }

    return this.activeChild.activate();
  }

  // Unbiased linear shifters
  next(): INavigable {
    return this.shift(1);
  }

  previous(): INavigable {
    return this.shift(-1);
  }

  private handleStolenActivation(
    stolenEvent: ActivityStolenEvent,
    nav: INavigable
  ) {
    if (
      this.activeChild &&
      this.activeChild.symbol === stolenEvent.directChild.symbol
    ) {
      if (
        !this.active.trulyActive ||
        this.active.trulyActive.symbol !== stolenEvent.original.symbol
      ) {
        this.active.trulyActive = stolenEvent.original; // Set truly active before bailing out
      }
      return;
    }

    // Deactivate child before continuing
    if (this.activeChild) {
      this.activeChild.deactivate();
    }

    // Make sure the new child actually a child
    this._activeIndex = this.children.findIndex(y => y === nav);
    if (this._activeIndex === -1) {
      throw Error('Could not find index of navigable child.');
    }

    // Deactivate the truly active navigable
    if (this.active.trulyActive) {
      this.active.trulyActive.deactivate();
    }

    // Set the new naviagable as active
    this.active.trulyActive = stolenEvent.original;
    this.changeDetector.detectChanges();
  }

  // Registration functions
  public registerNavigable(nav: INavigable) {
    this.children.set(nav.priority, nav);
    this.childSubscriptions[nav.symbol] = nav.onActivate.subscribe(
      stolenEvent => this.handleStolenActivation(stolenEvent, nav)
    );
    this.changeDetector.detectChanges();
  }

  public unregisterNavigable(nav: Navigable) {
    // Remove the nav from children
    this.children.delete(nav.priority, nav);

    // Unsubscribe from future events from removed children to avoid leak
    const sub = this.childSubscriptions[nav.symbol];
    this.childSubscriptions[nav.symbol] = null;
    this.childSubscriptions.delete(nav.symbol);

    // Destroy nav and subscription
    sub.unsubscribe();
    if (typeof (nav as any).destroy === 'function') {
      (nav as any).destroy();
    }

    this.changeDetector.detectChanges();
  }

  canActivate(): boolean {
    return true;
  }
}
