import { INavigable, Navigable } from './navigable';
import { Unsubscribable } from 'rxjs';
import { PriorityMap } from './priority-map';

export interface LinearShifter {
  /**
   * Should shift to the next child
   * @return  The newly activate child
   */
  next(): INavigable;

  /**
   * Should shift to the previous child and return it
   * @return  The newly activate child
   */
  previous(): INavigable;
}

export interface INavigableGroup extends INavigable, LinearShifter {
  /**
   * The child currently active. Should only be non-null when the whole
   * navigable hierarchy to this child is active.
   */
  readonly activeChild: INavigable;

  /**
   * Registers a child and set appropriate callbacks to deal with it stealing
   * activity
    @param nav  Navigable child to register
   */
  registerNavigable(nav: INavigable): void;

  /**
   * Unregister a child and does any cleanup necessary
   * @param nav Navigable child to unregister
   */
  unregisterNavigable(nav: INavigable): void;
}

export type FlowStrategy =
  | 'parent-previous' // Asks the parent to go to its previous child
  | 'parent-next' // Asks the parent to go to its next child
  | 'parent-right' // Asks the parent to trigger right
  | 'none' // Do nothing if you would overflow or underflow
  | 'wrap'; // Wrap index with circular over/underflow

/**
 * Responsibilities:
 * A navigable group is a (potentially nested) collection of navigable objects.
 * While it implements the Navigable class itself it does not determine what
 * activation means itself, allowing the implementer to determine this.
 */
export abstract class NavigableGroup
  extends Navigable
  implements INavigableGroup, INavigable
{
  private _activeIndex: number = null;
  get length() {
    return this.children.length;
  }

  overflowStrategy: FlowStrategy = 'wrap';
  underflowStrategy: FlowStrategy = 'wrap';

  protected get activeIndex(): number {
    return this._activeIndex;
  }

  get activeChild() {
    return this.children.length > this.activeIndex
      ? this.children.getIndex(this.activeIndex)
      : null;
  }

  /**
   * Observable subscriptions to be cleaned up.
   */
  public subs = new Map<symbol, Unsubscribable>();

  /**
   * Internal navigable group to hook to fullcalendar
   */
  protected parent: INavigableGroup;
  /**
   * Storage for fullcalendar elements
   */
  protected readonly children = new PriorityMap<INavigable>();
  protected constructor() {
    super();
  }

  /**
   * Provides a new index to go to on underflow
   * @param newIndex    The overflows desired index
   * @returns The new index
   */
  protected getUnderflowIndex(newIndex: number): number {
    switch (this.underflowStrategy) {
      case 'none':
        return this.activeIndex;
      case 'wrap':
      default:
        return this.children.length + newIndex; // Wrap to the end
    }
  }

  /**
   * Provides a new index to go to on overflow
   * @param newIndex    The overflows desired index
   * @returns The new index
   */
  protected getOverflowIndex(newIndex: number): number {
    switch (this.overflowStrategy) {
      case 'none':
        return this.activeIndex;
      case 'wrap':
      default:
        return newIndex % this.children.length; // Wrap to the end
    }
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
   * OrthogonalShifter is a helper function that lets you move forwards or backwards,
   * dealing with underflow as it goes.
   * @param shifter
   */
  protected shift(shifter: number): INavigable {
    // If nothing is active
    if (this.activeIndex === -1 || this.activeIndex === null) {
      this.updateActive(this.activeIndex);
    }

    // Safely update index
    const originalIndex = this.activeIndex;
    const lastIndex = this.children.length - 1;
    for (let attempts = 0; attempts < this.children.length; attempts++) {
      let safeIndex = originalIndex + shifter + attempts * Math.sign(shifter);

      if (safeIndex < 0) {
        switch (this.underflowStrategy) {
          case 'parent-previous':
            this.updateActive(null);
            return this.parent.previous();
          case 'parent-next':
            this.updateActive(null);
            return this.parent.next();
          case 'wrap':
          case 'none':
            safeIndex = this.getUnderflowIndex(safeIndex);
            break;
        }
      } else if (safeIndex > lastIndex) {
        switch (this.overflowStrategy) {
          case 'parent-previous':
            this.updateActive(null);
            return this.parent.previous();
          case 'parent-next':
            this.updateActive(null);
            return this.parent.next();
          case 'parent-right':
            this.updateActive(null);
            return this.parent.right();
          case 'wrap':
          case 'none':
            safeIndex = this.getOverflowIndex(safeIndex);
            break;
        }
      }

      if (!this.children.getIndex(safeIndex).canActivate()) {
        continue;
      }

      this.updateActive(safeIndex);
      return this.activeChild.activate();
    }

    throw Error("didn't update. Never found viable candidate");
  }

  canActivate(): boolean {
    if (Boolean(this.children && this.children.length > 0)) {
      for (const child of this.children) {
        if (child.canActivate()) {
          return true;
        }
      }
    }

    return false;
  }

  // Unbiased linear shifters
  next(): INavigable {
    return this.shift(1);
  }

  previous(): INavigable {
    return this.shift(-1);
  }

  // Registration functions
  registerNavigable(nav: INavigable) {
    this.children.set(nav.priority !== undefined ? nav.priority : null, nav);
    const handleNavChildActivation = e => {
      if (
        this.activeChild &&
        this.activeChild.symbol === e.directChild.symbol
      ) {
        return;
      }

      if (this.activeChild) {
        this.activeChild.deactivate();
      }

      const index = [...this.children].findIndex(y => y === nav);
      if (index !== this._activeIndex) {
        this._activeIndex = index;
      }

      if (this._activeIndex === -1) {
        throw Error('Could not find index of navigable child.');
      }
      this.emitActivated(e.chain(this));
    };
    this.subs[nav.symbol] = nav.onActivate.subscribe(handleNavChildActivation);
  }

  unregisterNavigable(nav: INavigable) {
    this.children.delete(nav.priority, nav);
    const navigable = this.subs[nav.symbol];
    navigable.unsubscribe();
    this.subs[nav.symbol] = null;
    this.subs.delete(nav.symbol);
    if (typeof (nav as any).destroy === 'function') {
      (nav as any).destroy();
    }
  }
}
