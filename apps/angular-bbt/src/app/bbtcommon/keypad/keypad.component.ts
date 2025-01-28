import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { INavigableGroup } from '../../four-directional-navigation/navigable-group';
import { RowKeySet } from '../keyboard/keyboard.component';

//export type KeypadOutput = number | 'clear' | 'backspace';
export type KeypadOutput = number | 'decimal' | 'backspace';

@Component({
  selector: 'bbt-keypad',
  templateUrl: './keypad.component.html',
  styleUrls: ['./keypad.component.scss'],
  exportAs: 'keypad'
})
export class KeypadComponent extends RowKeySet {
  @Output() newPress = new EventEmitter<KeypadOutput>();
  @Input() parentNav: INavigableGroup;
  @Input() priority: number;
  constructor(private changeDetector: ChangeDetectorRef) {
    super();
  }

  setRepresentativeChild(el) {
    super.setRepresentativeChild(el);
    this.changeDetector.detectChanges();
  }
}
