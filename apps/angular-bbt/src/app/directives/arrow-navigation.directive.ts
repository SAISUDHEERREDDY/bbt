import { Directive, HostListener, ElementRef, HostBinding } from '@angular/core';

@Directive({
  selector: '[appArrowNavigation]'
})
export class ArrowNavigationDirective {
  @HostBinding('attr.tabindex') tabindex = 0;

  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event']) onKeydown(event: KeyboardEvent) {
    console.log("Key pressed:", event.key); // Debugging output
    switch (event.key) {
      case 'ArrowUp':
        this.moveFocus('up');
        break;
      case 'ArrowDown':
        this.moveFocus('down');
        break;
      case 'ArrowLeft':
        this.moveFocus('left');
        break;
      case 'ArrowRight':
        this.moveFocus('right');
        break;
      default:
        break;
    }
  }

  private moveFocus(direction: string) {
    const currentElement = this.el.nativeElement;
    let nextElement;

    switch (direction) {
      case 'up':
      case 'left':
        nextElement = currentElement.previousElementSibling;
        break;
      case 'down':
      case 'right':
        nextElement = currentElement.nextElementSibling;
        break;
      default:
        break;
    }

    if (nextElement) {
      nextElement.focus();
    }
  }
}
