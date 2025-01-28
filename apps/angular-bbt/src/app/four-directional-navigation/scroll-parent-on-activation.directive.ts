import { Directive, ElementRef, Input, OnDestroy } from '@angular/core';
import { Unsubscribable } from 'rxjs';
import { NavigableRowDirective } from './navigable-row.directive';

@Directive({
  selector: '[bbtScrollParentOnActivation]'
})
export class ScrollParentOnActivationDirective implements OnDestroy {
  @Input('bbtScrollParentOnActivation') direction:
    | 'horizontal'
    | 'vertical'
    | 'both';

  private subs = new Set<Unsubscribable>();

  constructor(
    private elementRef: ElementRef,
    private navigable: NavigableRowDirective
  ) {
    this.subs.add(
      navigable.activated.subscribe(() => {
        this.triggerParentScroll();
      })
    );
  }

  triggerParentScroll() {
    const el = this.elementRef.nativeElement;
    const parent = el.parentElement;

    if (this.direction !== 'vertical') {
      const shift = el.offsetLeft > 40 ? el.offsetLeft - 40 : el.offsetLeft;
      el.parentElement.scrollTo({
        behavior: 'smooth',
        left: shift
      });
    }

    if (this.direction !== 'horizontal') {
      const base = el.offsetTop - parent.offsetTop;

      el.parentElement.scrollTo({
        behavior: 'smooth',
        top: base
      });
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(x => x.unsubscribe());
  }
}
