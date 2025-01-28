import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges
} from '@angular/core';
import { INavigableGroup } from './navigable-group';
import { INavigable, Navigable } from './navigable';
import { ActivityStolenEvent } from './activity-stolen-event';
import { ActiveService } from './active.service';

export enum DefaultDeferOptions {
  None = 'none',
  Parent = 'parent'
}

@Directive({
  selector: '[bbtDeferringNavigable]',
  exportAs: 'navigable'
})
/**
 * This directive tries to be as generic as possible while still achieving the
 * goals of being navigable. It has intelligent defaults, but they can all be
 * turned off if desired
 */
export class DeferringNavigableDirective
  extends Navigable
  implements OnInit, OnChanges, OnDestroy, AfterViewInit
{
  private isActive = false;

  @Input() priority: number = null;
  @Input() parent: INavigableGroup;
  @Input() defaultDefer: DefaultDeferOptions = DefaultDeferOptions.Parent;
  @Input() focusOnActivation = true;

  /**
   * CSS class to apply when active
   */
  @Input() activeClass: string = 'defering-navigable-active';

  /**
   * If true will steal focus during onInit
   */
  @Input() stealFocusOnInit: boolean;
  /**
   * Fires if focus is stolen on init
   */
  @Output() initialFocusOnInitComplete = new EventEmitter();

  // Target Overrides
  // Inputs that provide a specific override to navigate to o
  @Input() targets: {
    up?: INavigable;
    down?: INavigable;
    left?: INavigable;
    right?: INavigable;
  };

  // Function call emitters
  // The following functions provide an angular way to do very similar things
  // to the basic navigable behavior
  @Output() activated = new EventEmitter<INavigable>();
  @Output() deactivated = new EventEmitter<INavigable>();
  @Output() upDone = new EventEmitter<INavigable>();
  @Output() downDone = new EventEmitter<INavigable>();
  @Output() leftDone = new EventEmitter<INavigable>();
  @Output() rightDone = new EventEmitter<INavigable>();

  // Lifecycle Callbacks
  @Output() whenInit = new EventEmitter<INavigable>();
  @Output() whenInitEl = new EventEmitter<ElementRef>();

  /**
   * To be fired when registered with a parent
   */
  @Output() registered = new EventEmitter<{
    self: INavigable;
    parent: INavigableGroup;
  }>();

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private changeDetection: ChangeDetectorRef,
    private active: ActiveService
  ) {
    super();
  }

  // activation state hooks
  activate(): INavigable {
    if (this.active.disabled) {
      return this;
    }

    this.isActive = true;
    if (this.activeClass) {
      this.renderer.addClass(this.el.nativeElement, this.activeClass);
    }
    if (this.focusOnActivation) {
      this.el.nativeElement.focus({ preventScroll: true });
    }
    this.activated.emit();
    return this;
  }

  deactivate(): INavigable {
    this.isActive = false;

    if (this.activeClass) {
      this.renderer.removeClass(this.el.nativeElement, this.activeClass);
    }
    if (this.focusOnActivation) {
      this.el.nativeElement.blur({ preventScroll: true });
    }
    this.deactivated.emit();
    return this;
  }

  // 4-direction navigation implementations
  private direction(dir: 'up' | 'down' | 'left' | 'right'): INavigable {
    // Check if specific target is set
    const target = this.targets?.[dir];
    if (target) {
      // Activate target and quit
      target.activate();
      return target;
    }

    switch (this.defaultDefer) {
      case DefaultDeferOptions.None:
        return this;
      case DefaultDeferOptions.Parent:
        return this.parent[dir]();
    }
  }

  down(): INavigable {
    const val = this.direction('down');
    this.downDone.emit(val);
    return val;
  }

  left(): INavigable {
    const val = this.direction('left');
    this.leftDone.emit(val);
    return val;
  }

  right(): INavigable {
    const val = this.direction('right');
    this.rightDone.emit(val);
    return val;
  }

  up(): INavigable {
    const val = this.direction('up');
    this.upDone.emit(val);
    return val;
  }

  // Angular lifecycle hooks
  ngOnInit(): void {
    // Register self with parent
    this.whenInit.emit(this);
    this.whenInitEl.emit(this.el);
  }

  ngOnDestroy(): void {
    // Tell parent to forget about this component
    this.parent?.unregisterNavigable(this);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // handle parent changes
    if (changes.parent) {
      // Fix registration with old parent
      if (changes.parent.previousValue) {
        changes.parent.previousValue.unregisterNavigable(this);
      }

      // Register with new parent
      changes.parent.currentValue.registerNavigable(this);
      this.registered.emit({
        self: this,
        parent: changes.parent.currentValue
      });
    }

    // Handle active class changes
    if (changes.activeClass && this.isActive) {
      // Remove previous class if it was set
      if (changes.activeClass.previousValue) {
        this.renderer.removeClass(
          this.el.nativeElement,
          changes.active.previousValue
        );
      }

      this.renderer.addClass(
        this.el.nativeElement,
        changes.active.currentValue
      );
    }
  }

  ngAfterViewInit(): void {
    if (this.stealFocusOnInit) {
      this.emitActivated(new ActivityStolenEvent(this));
      this.activate();
      this.changeDetection.detectChanges();
      this.initialFocusOnInitComplete.emit();
    }
  }

  canActivate(): boolean {
    return true;
  }
}
