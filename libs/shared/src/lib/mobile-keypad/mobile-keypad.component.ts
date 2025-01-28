import { Component, Output, EventEmitter } from '@angular/core';
export type KeypadOutput = number | 'decimal' | 'backspace';

@Component({
  selector: 'shared-mobile-keypad',
  templateUrl: './mobile-keypad.component.html',
  styleUrls: ['./mobile-keypad.component.scss']
})
export class MobileKeypadComponent {
  @Output() newPress = new EventEmitter<KeypadOutput>();
}
