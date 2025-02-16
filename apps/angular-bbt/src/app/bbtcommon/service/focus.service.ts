import { ElementRef, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FocusService {
  private focusIndex = 0;
  private focusElements: ElementRef[] = []; // Global list of focusable elements
  private focusPositions: { x: number, y: number }[] = []; // Track positions of focusable elements
  private focusChangeSubject = new Subject<number>();
  focusChange$ = this.focusChangeSubject.asObservable();

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

  registerElements(elements: ElementRef[], positions: { x: number, y: number }[]) {
    elements.forEach((element, index) => {
      if (!this.focusElements.some((el) => el.nativeElement === element.nativeElement)) {
        this.focusElements.push(element);
        this.focusPositions.push(positions[index]);
      }
    });
  }

  getRegisteredElements(): ElementRef[] {
    return this.focusElements;
  }

  findElementIndex(element: ElementRef): number {
    return this.focusElements.findIndex((el) => el === element);
  }

  clearRegisteredElements() {
    this.focusElements = [];
    this.focusPositions = [];
  }

  getFocusIndex(): number {
    return this.focusIndex;
  }

  moveFocus(direction: 'up' | 'down' | 'left' | 'right') {
    const currentPosition = this.focusPositions[this.focusIndex];
    let newIndex = -1;
  
    if (direction === 'up') {
      newIndex = this.findClosestElement(currentPosition, 'y', -1); // Find element above
      console.log('New Index (Up):', newIndex); // Debugging
    } else if (direction === 'down') {
      newIndex = this.findClosestElement(currentPosition, 'y', 1); // Find element below
    } else if (direction === 'left') {
      newIndex = this.findClosestElement(currentPosition, 'x', -1); // Find element to the left
    } else if (direction === 'right') {
      newIndex = this.findClosestElement(currentPosition, 'x', 1); // Find element to the right
    }
  
    if (newIndex !== -1) {
      this.setFocus(newIndex);
    }
  }
  
  private findClosestElement(currentPosition: { x: number, y: number }, axis: 'x' | 'y', direction: number): number {
    let closestIndex = -1;
    let closestDistance = Infinity;
  
    this.focusPositions.forEach((position, index) => {
      if (index === this.focusIndex) return; // Skip the currently focused element
  
      // Relax the column constraint for up/down movement
      const isSameAxis = true; // Allow elements in different columns
      const isDirectionMatch = axis === 'x' ? (direction === -1 ? position.x < currentPosition.x : position.x > currentPosition.x) :
                                             (direction === -1 ? position.y < currentPosition.y : position.y > currentPosition.y);
  
      if (isSameAxis && isDirectionMatch) {
        const distance = Math.abs(position[axis] - currentPosition[axis]);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      }
    });
  
    return closestIndex;
  }

  focusFirstElement() {
    if (this.focusElements.length > 0) {
      this.setFocus(0);
    }
  }

  focusLastElement() {
    const lastIndex = this.focusElements.length - 1;
    if (lastIndex >= 0) {
      this.setFocus(lastIndex);
    }
  }
}