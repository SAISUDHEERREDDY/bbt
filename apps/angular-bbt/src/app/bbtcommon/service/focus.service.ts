import { ElementRef, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FocusService {
  private focusIndex = 0;
  private focusElements: ElementRef[] = []; // Global list of focusable elements
  private focusChangeSubject = new Subject<number>();
  focusChange$ = this.focusChangeSubject.asObservable();

  /**
   * Sets focus to the element at the specified index and emits the change
   * @param index The index of the focusable element to focus
   */
  setFocus(index: number) {
    this.focusIndex = index;
    const element = this.focusElements[index]?.nativeElement;
    if (element) {
      element.focus();
      this.focusChangeSubject.next(this.focusIndex);
    } else {
      console.warn(`No element found at index ${index}`);
    }
  }

  /**
   * Registers multiple focusable elements from different components
   * @param elements An array of ElementRef focusable elements
   */
  registerElements(elements: ElementRef[]) {
    elements.forEach((element) => this.focusElements.push(element));
  }
  getRegisteredElements(): ElementRef[] {
    return this.focusElements;
  }
  findElementIndex(element: ElementRef): number {
    return this.focusElements.findIndex((el) => el === element);
  }
  clearRegisteredElements() {
    this.focusElements = [];
  }
  /**
   * Returns the current focus index
   */
  getFocusIndex(): number {
    return this.focusIndex;
  }

  /**
   * Moves focus to the previous or next element, stopping at boundaries
   * @param direction -1 for previous, 1 for next
   */
  moveFocus(direction: -1 | 1) {
    const totalElements = this.focusElements.length;

    // Calculate the new index based on the direction
    let newIndex = this.focusIndex + direction;

    // Check if new index is within bounds
    if (newIndex >= 0 && newIndex < totalElements) {
      this.setFocus(newIndex);
    } else {
      console.log("Reached focus boundary. Focus will not move further.");
    }
  }
}
