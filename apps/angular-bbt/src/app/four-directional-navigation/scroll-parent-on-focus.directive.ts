import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  Input
} from '@angular/core';

const calculateOffset = (base: number) => (base > 40 ? base - 40 : base);

@Directive({
  selector: '[bbtScrollParentOnFocus]'
})
export class ScrollParentOnFocusDirective implements AfterViewInit {
  @Input('bbtScrollParentOnFocus') direction:
    | 'horizontal'
    | 'vertical'
    | 'both';
  @Input() isFirst: boolean;

  /**
   * A flag to detect if the view has initialized
   * @private
   */
  private afterInit = false;
  private attemptOnInit = false;

  constructor(private elementRef: ElementRef) {}

  @HostListener('focus', ['$event'])
  triggerParentScroll($event) {
    const el = this.elementRef?.nativeElement;

    if ($event?.relatedTarget) {
      return; // focus is probably click based don't scroll.
    }

    if (!this.afterInit) {
      // defer until after view init
      this.attemptOnInit = true;
    }

    if (this.direction !== 'vertical') {
      el.parentElement.scrollTo({
        behavior: 'smooth',
        left: this.isFirst ? 0 : calculateOffset(el.offsetLeft)
      });
    }

    if (this.direction !== 'horizontal') {
      el.parentElement.scrollTo({
        behavior: 'smooth',
        top: this.isFirst ? 0 : calculateOffset(el.offsetTop)
      });
    }

    return true;
  }

  ngAfterViewInit(): void {
    this.afterInit = true;

    if (this.attemptOnInit) {
      this.triggerParentScroll(null);
    }
  }
}
