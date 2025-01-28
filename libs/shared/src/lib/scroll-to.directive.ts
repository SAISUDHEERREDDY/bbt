import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[sharedScrollTo]'
})
export class ScrollToDirective implements AfterViewInit {
  private _shouldScrollTo = false;
  /**
   * True if element should be scrolled to
   */
  @Input() set shouldScrollTo(val: boolean) {
    this._shouldScrollTo = val;
    if (!val) return;
    this.element?.nativeElement?.scrollIntoView();
  }

  constructor(private element: ElementRef) {}

  ngAfterViewInit(): void {
    this.shouldScrollTo = this._shouldScrollTo;
  }
}
