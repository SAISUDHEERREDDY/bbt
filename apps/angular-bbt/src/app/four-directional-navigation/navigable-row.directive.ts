import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SkipSelf
} from '@angular/core';
import { INavigable } from './navigable';
import { NavigableRootComponent } from './navigable-root.component';
import { ActivityStolenEvent } from './activity-stolen-event';
import { INavigableGroup, NavigableGroup } from './navigable-group';

@Directive({
  selector: '[bbtNavigableRow]',
  exportAs: 'navRow'
})
export class NavigableRowDirective
  extends NavigableGroup
  implements OnInit, OnDestroy, AfterViewInit, INavigableGroup
{
  constructor(
    @SkipSelf() parent: NavigableRootComponent,
    public el: ElementRef
  ) {
    super();
    this.parent = parent;
  }

  @Input() stealFocusOnInit = false;
  @Output() activated = new EventEmitter<boolean>();
  @Output() deactivated = new EventEmitter<void>();

  // Angular lifecycle hooks
  ngOnInit(): void {
    this.parent.registerNavigable(this); // Register self with parent
  }

  stealFocus() {
    const org = this.activate();
    this.emitActivated(new ActivityStolenEvent(org, this));
  }

  ngAfterViewInit(): void {
    if (this.stealFocusOnInit) {
      this.stealFocus();
    }
  }

  ngOnDestroy(): void {
    // Tell parent to forget about this component
    this.parent.unregisterNavigable(this);
  }

  activate(): INavigable {
    if (this.activeChild) {
      return this.activeChild.activate();
    } else if (this.children.length) {
      this.updateActive(0);
    } else {
      return null;
    }

    this.activated.emit(true);

    return this.activeChild.activate();
  }

  // Navigable Implements
  down(): INavigable {
    return this.parent.next();
  }

  left(): INavigable {
    return this.previous();
  }

  right(): INavigable {
    return this.next();
  }

  up(): INavigable {
    return this.parent.previous();
  }

  deactivate(): INavigable {
    if (!this.activeChild) {
      return null;
    }

    const old = this.activeChild.deactivate();
    this.updateActive(null);
    this.deactivated.emit();
    return old;
  }

  canActivate(): boolean {
    return true;
  }
}
