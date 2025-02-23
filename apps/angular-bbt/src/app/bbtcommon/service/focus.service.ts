import { ElementRef, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FocusService {
  private focusIndex = { row: 0, col: 0 }; // Track current focus position (row and column)
  private focusGrid: ElementRef[][] = []; // 2D array to store focusable elements in rows and columns
  private focusChangeSubject = new Subject<{ row: number, col: number }>();
  focusChange$ = this.focusChangeSubject.asObservable();

  setFocus(row: number, col: number) {
    const element = this.focusGrid[row]?.[col]?.nativeElement;
    if (element) {
      element.focus();
      this.focusIndex = { row, col };
      this.focusChangeSubject.next({ row, col });
    } else {
      console.warn(`No element found at row ${row}, column ${col}`);
    }
  }

  registerElements(row: number, elements: ElementRef[]) {
    if (!this.focusGrid[row]) {
      this.focusGrid[row] = []; // Initialize the row if it doesn't exist
    }

    elements.forEach((element, col) => {
      if (!this.focusGrid[row].some((el) => el.nativeElement === element.nativeElement)) {
        this.focusGrid[row][col] = element; // Add element to the specified row and column
      }
    });

    console.log("Focus Grid:", this.focusGrid);
  }

  getRegisteredElements(): ElementRef[][] {
    return this.focusGrid;
  }

  findElementIndex(element: ElementRef): { row: number, col: number } | null {
    for (let row = 0; row < this.focusGrid.length; row++) {
      for (let col = 0; col < this.focusGrid[row].length; col++) {
        if (this.focusGrid[row][col] === element) {
          return { row, col };
        }
      }
    }
    return null;
  }

  clearRegisteredElements() {
    this.focusGrid = [];
    this.focusIndex = { row: 0, col: 0 };
  }

  getFocusIndex(): { row: number, col: number } {
    return this.focusIndex;
  }

  moveFocus(direction: 'up' | 'down' | 'left' | 'right') {
    const { row, col } = this.focusIndex;

    switch (direction) {
      case 'up':
        if (row > 0) {
          // Move to the first element in the previous row
          this.setFocus(row - 1, 0);
        }
        break;

      case 'down':
        if (row < this.focusGrid.length - 1) {
          // Move to the first element in the next row
          this.setFocus(row + 1, 0);
        }
        break;

      case 'left':
        if (col > 0) {
          // Move to the previous element in the same row
          this.setFocus(row, col - 1);
        }
        break;

      case 'right':
        if (col < this.focusGrid[row].length - 1) {
          // Move to the next element in the same row
          this.setFocus(row, col + 1);
        }
        break;
    }
  }

  focusFirstElement() {
    if (this.focusGrid.length > 0 && this.focusGrid[0].length > 0) {
      this.setFocus(0, 0); // Focus on the first element in the first row
    }
  }

  focusLastElement() {
    if (this.focusGrid.length > 0) {
      const lastRow = this.focusGrid.length - 1;
      const lastCol = this.focusGrid[lastRow].length - 1;
      this.setFocus(lastRow, lastCol); // Focus on the last element in the last row
    }
  }
}