import { AfterViewInit, Directive } from '@angular/core';
import { Navigable } from './navigable';

@Directive({
  selector: '[bbtActivateAfterViewInit]'
})
export class ActivateAfterViewInitDirective implements AfterViewInit {
  constructor(private host: Navigable) {}

  ngAfterViewInit(): void {
    this.host.activate();
  }
}
