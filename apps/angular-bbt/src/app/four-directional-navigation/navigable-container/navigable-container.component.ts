import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  SimpleChanges,
  SkipSelf,
  ViewChild
} from '@angular/core';
import { INavigable } from '../navigable';
import {
  FlowStrategy,
  INavigableGroup,
  LinearShifter,
  NavigableGroup
} from '../navigable-group';
import { NavigableRootComponent } from '../navigable-root.component';
import { ActiveService } from '../active.service';
import { OrthogonalShifter } from '../OrthogonalShifter';

export type DelegationStrategy =
  // Parent: handle events internally when possible.
  // Otherwise send it to your parent
  | 'delegate' // Calls the same method on the parent.
  | 'parent' // Uses parents next/previous to shift
  | 'self' // Handles events yourself. Never send to parent
  | 'none'; // Active self (and by proxy your child. Do nothing else.

@Component({
  selector: 'bbt-navigable-container',
  template:
    '<div class="navigable-container-containment" #containment><ng-content></ng-content></div>',
  exportAs: 'navigableGroup',
  changeDetection: ChangeDetectionStrategy.OnPush
})
/**
 * A navigable container component presumes that it has a series of navigable
 * elements as its content children that wrap when they reach the edge of its
 * width
 */
export class NavigableContainerComponent
  extends NavigableGroup
  implements OnDestroy, OnChanges, OnInit
{
  @ViewChild('containment', { static: true }) containment: ElementRef;
  @Input() representativeChild: ElementRef;
  @Input() priority: number;

  /**
   * The default strategy for the left and right actions
   */
  @Input() horizontalStrategy: DelegationStrategy = 'self';

  /**
   * The default strategy for the up and down actions
   */
  @Input() verticalStrategy: DelegationStrategy = 'parent';

  @Input() parentOverride: INavigableGroup;

  @Input() overflowStrategy: FlowStrategy = 'wrap';
  @Input() underflowStrategy: FlowStrategy = 'wrap';

  /**
   * parentHierarchy
   * A helper function to select what the parent should be in this situation.
   * Should include any fail back logic for when anything is null.
   * @param overrideValue The override value. Can be passed in so it can
   * calculate what the override value would have been.
   * @returns  The parent that should be active
   */
  private parentHierarchy(
    overrideValue: INavigableGroup = this.parentOverride
  ) {
    return overrideValue || this.closest || this.root || this.active;
  }

  constructor(
    @Optional() private root: NavigableRootComponent,
    @Optional() @SkipSelf() private closest: NavigableContainerComponent,
    private active: ActiveService
  ) {
    super();
  }

  // Activation
  activate(): INavigable {
    if (this.activeChild) {
      return this.activeChild.activate();
    } else if (this.children.length) {
      this.updateActive(0);
    } else {
      return null;
    }

    return this.activeChild.activate();
  }

  deactivate(): INavigable {
    if (!this.activeChild) {
      return null;
    }

    const old = this.activeChild.deactivate();
    this.updateActive(null);

    return old;
  }

  /**
   * A general purpose shifter for all strategies
   * @param linearDirection       The directions to shift in a list
   * @param orthogonalDirection   The direction orthogonally to be shifted
   * @param delegationStrategy    The strategy that determines who is
   *                              responsible for the shift
   */
  private generalizedShifter(
    linearDirection: keyof LinearShifter,
    orthogonalDirection: keyof OrthogonalShifter,
    delegationStrategy: DelegationStrategy
  ): INavigable {
    switch (delegationStrategy) {
      case 'none':
        return this.activate();
      case 'self':
        return this[linearDirection]();
      case 'delegate':
        return this.parent[orthogonalDirection]();
      case 'parent':
        return this.parent[linearDirection]();
    }
  }

  // Navigable Implements
  down(): INavigable {
    if (this.verticalStrategy === 'parent') {
      const handlerSettings = this.shouldHandleInternally(1);
      if (handlerSettings.handle) {
        return this.shift(handlerSettings.shift);
      }
    }

    return this.generalizedShifter('next', 'down', this.verticalStrategy);
  }

  left(): INavigable {
    return this.generalizedShifter('previous', 'left', this.horizontalStrategy);
  }

  right(): INavigable {
    return this.generalizedShifter('next', 'right', this.horizontalStrategy);
  }

  up(): INavigable {
    if (this.verticalStrategy === 'parent') {
      const handlerSettings = this.shouldHandleInternally(-1);
      if (handlerSettings.handle) {
        return this.shift(handlerSettings.shift);
      }
    }

    return this.generalizedShifter('previous', 'up', this.verticalStrategy);
  }

  private shouldHandleInternally(directionScalar: 1 | -1): {
    handle: boolean;
    shift: number;
  } {
    // If there is no representative child give up
    if (!this.representativeChild) return { handle: false, shift: null };

    const containerWidth = this.containment.nativeElement.scrollWidth;
    const childWidth = this.representativeChild.nativeElement.scrollWidth;
    const childrenPerRow = Math.floor(containerWidth / childWidth);
    const shift = childrenPerRow * directionScalar;
    const newIndex = this.activeIndex + shift;
    const limit =
      directionScalar === 1
        ? this.children.length // Limit is the size of the array
        : 0; // Limit is whole numbers

    const handle =
      directionScalar === 1
        ? limit > newIndex // Shift shouldn't overflow
        : newIndex >= limit; // Shift shouldn't underflow

    return { handle, shift };
  }

  // Angular Lifecycle Hooks
  ngOnInit() {
    this.parent = this.parentHierarchy();
    this.parent.registerNavigable(this);
  }

  ngOnDestroy(): void {
    this.parent.unregisterNavigable(this);
    this.subs.forEach(x => x.unsubscribe());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.parentOverride) {
      // Fail back to root
      const previous = this.parentHierarchy(
        changes.parentOverride.previousValue
      );
      const current = this.parentHierarchy();

      if (previous !== current) {
        // Fix registration with old parent
        if (previous) {
          previous.unregisterNavigable(this);
        }

        this.parent = current;
        // Register with new parent
        current.registerNavigable(this);
      }
    }
  }
}
