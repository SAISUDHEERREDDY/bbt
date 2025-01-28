import {
  INavigableGroup,
  NavigableGroup
} from '../../four-directional-navigation/navigable-group';
import { INavigable } from '../../four-directional-navigation/navigable';
import { ResourceNavigable } from './ResourceNavigable';

export class ResourceNavigableGroup extends NavigableGroup {
  constructor(parent: INavigableGroup, priority?: number) {
    super();
    this.parent = parent;
    this.priority = priority;
  }

  onActivateCallback: () => void;
  onDeactivateCallback: () => void;

  /**
   * Shifter is a helper function that lets you move forwards or backwards,
   * delegating under and overflow to parent
   * @param shifter
   */
  protected shift(shifter: number): INavigable {
    // If nothing is active
    if (this.activeIndex === -1 || this.activeIndex === null) {
      this.updateActive(this.activeIndex);
    }

    // Safely update index
    const lastIndex = this.children.length - 1;
    const newIndex = this.activeIndex + shifter;
    if (newIndex < 0) {
      return this.parent.previous().activate();
    } else if (newIndex > lastIndex) {
      return this.parent.next().activate();
    } else {
      this.updateActive(newIndex);
    }

    return this.activeChild.activate();
  }

  activate(): INavigable {
    if (!this.activeChild) {
      if (!this.children.length) {
        throw new Error('No child to activate');
      }
    }

    if (this.onActivateCallback) {
      this.onActivateCallback();
    }

    return this.activeChild.activate();
  }

  deactivate(): INavigable {
    if (this.onDeactivateCallback) {
      this.onDeactivateCallback();
    }

    return this;
  }

  down(): INavigable {
    return this.shift(1);
  }

  left(): INavigable {
    return this.selfSelect();
  }

  right(): INavigable {
    return this.selfSelect();
  }

  up(): INavigable {
    return this.shift(-1);
  }

  registerNavigable(nav: ResourceNavigable) {
    super.registerNavigable(nav);
    [...this.children].sort((a, b) => {
      const x = Number.parseInt((a as ResourceNavigable).id, 10);
      const y = Number.parseInt((b as ResourceNavigable).id, 10);
      return x - y;
    });
  }

  dumpChildren() {
    [...this.children].forEach(nav => {
      this.unregisterNavigable(nav);
      this.children.delete(nav.priority, nav);
    });
  }

  canActivate(): boolean {
    return true;
  }
}
