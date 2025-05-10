import { ElementRef, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FocusService {
  private focusGrid: { [key: string]: ElementRef[] } = {}; // Map to store focusable elements for each row
  private focusedColumns: { [key: string]: number } = {}; // Map to track the focused column for each row
  private focusChangeSubject = new Subject<{ rowId: string, col: number }>();
  private lastFocusedRowId: string | null = null; // Track the last focused rowId
  focusChange$ = this.focusChangeSubject.asObservable();

  setFocus(rowId: string, col: number) {
    const rowElements = this.focusGrid[rowId];
    if (rowElements && rowElements[col]?.nativeElement) {
      rowElements[col].nativeElement.focus();
      this.focusedColumns[rowId] = col; // Update the focused column for the row
      this.lastFocusedRowId = rowId; // Update the last focused rowId
      this.focusChangeSubject.next({ rowId, col }); // Notify subscribers
    } else {
      console.warn(`No element found for row ${rowId}, column ${col}`);
    }
  }


  registerElements(rowId: string, elements: ElementRef[]) {
    if (!this.focusGrid[rowId]) {
      this.focusGrid[rowId] = []; // Initialize the row if it doesn't exist
    }

    elements.forEach((element, col) => {
      if (!this.focusGrid[rowId].some((el) => el.nativeElement === element.nativeElement)) {
        this.focusGrid[rowId][col] = element; // Add element to the specified row and column
      }
    });

    console.log("Focus Grid:", this.focusGrid);
  }

  getRegisteredElements(): { [key: string]: ElementRef[] } {
    return this.focusGrid;
  }

  findElementIndex(element: ElementRef): { rowId: string, col: number } | null {
    for (const rowId in this.focusGrid) {
      const row = this.focusGrid[rowId];
      for (let col = 0; col < row.length; col++) {
        if (row[col] === element) {
          return { rowId, col };
        }
      }
    }
    return null;
  }

  clearRegisteredElements() {
    this.focusGrid = {};
    this.focusedColumns = {};
  }

  getFocusedColumn(rowId: string): number {
    return this.focusedColumns[rowId] || 0;
  }

  moveFocus(rowId: string, direction: 'up' | 'down' | 'left' | 'right') {
    const currentCol = this.focusedColumns[rowId] || 0;
    const rowElements = this.focusGrid[rowId];

    if (!rowElements) return;

    switch (direction) {
      case 'up':
        // Move to the previous row (if exists)
        const prevRowId = Object.keys(this.focusGrid).find((id, index, array) => array[index - 1] === rowId);
        if (prevRowId) {
          this.setFocus(prevRowId, this.focusedColumns[prevRowId] || 0);
        }
        break;

      case 'down':
        // Move to the next row (if exists)
        const nextRowId = Object.keys(this.focusGrid).find((id, index, array) => array[index + 1] === rowId);
        if (nextRowId) {
          this.setFocus(nextRowId, this.focusedColumns[nextRowId] || 0);
        }
        break;

      case 'left':
        if (currentCol > 0) {
          this.setFocus(rowId, currentCol - 1);
        }
        break;

      case 'right':
        if (currentCol < rowElements.length - 1) {
          this.setFocus(rowId, currentCol + 1);
        }
        break;
    }
  }

  getCurrentFocusedRowId(): string | null {
    return this.lastFocusedRowId; // Return the last focused rowId
  }

  focusFirstElement(rowId: string) {
    if (this.focusGrid[rowId]?.length > 0) {
      this.setFocus(rowId, 0); // Focus on the first element in the specified row
    }
  }

  focusLastElement(rowId: string) {
    const rowElements = this.focusGrid[rowId];
    if (rowElements?.length > 0) {
      this.setFocus(rowId, rowElements.length - 1); // Focus on the last element in the specified row
    }
  }
}