import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import { I18nService } from './i18n.service';

@Directive({
  selector: '[bbti18n]'
})
export class I18NDirective implements AfterViewInit {
  @Input('bbti18n') key: string;

  constructor(private i18n: I18nService, private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.el.nativeElement.setAttribute('data-i18n', this.key);
    this.el.nativeElement.innerHTML = this.i18n.i18n(this.key);
  }
}
