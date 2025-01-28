import {
  Directive,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Renderer2
} from '@angular/core';
import { INavigable, Navigable } from './navigable';
import { NavigableRowDirective } from './navigable-row.directive';

@Directive({
  selector: '[bbtFocusingNavigable]'
})
export class FocusingNavigableDirective
  extends Navigable
  implements OnInit, OnDestroy
{
  @Input() priority: number = null;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    @Inject(NavigableRowDirective) private parent: NavigableRowDirective
  ) {
    super();
  }

  // Angular lifecycle hooks
  ngOnInit(): void {
    this.parent.registerNavigable(this); // Register self with parent
  }

  ngOnDestroy(): void {
    // Tell parent to forget about this component
    this.parent.unregisterNavigable(this);
  }

  activate(): INavigable {
    this.renderer.addClass(this.el.nativeElement, 'active');
    this.el.nativeElement.focus({ preventScroll: 'true' });
    return this;
  }

  deactivate(): INavigable {
    this.renderer.removeClass(this.el.nativeElement, 'active');
    this.el.nativeElement.blur({ preventScroll: 'true' });
    return this;
  }

  down(): INavigable {
    return this.parent.down();
  }

  left(): INavigable {
    return this.parent.left();
  }

  right(): INavigable {
    return this.parent.right();
  }

  up(): INavigable {
    return this.parent.up();
  }

  canActivate(): boolean {
    return true;
  }
}
