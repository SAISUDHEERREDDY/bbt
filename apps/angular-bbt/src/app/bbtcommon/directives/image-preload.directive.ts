import { Directive, Input, Renderer2, ElementRef } from '@angular/core';

@Directive({
  host: {
    '(error)': 'updateUrl()',
    '(load)': 'load()',
    '[src]': 'src'
  },
  selector: '[img[default]]'
})
export class ImagePreloadDirective {
  @Input() src: string;
  @Input() default: string;

  constructor(private renderer: Renderer2, private el: ElementRef) {}
  updateUrl() {
    this.src = this.default;
  }
  load() {
    this.renderer.addClass(this.el.nativeElement, 'image-loaded');
  }
}
