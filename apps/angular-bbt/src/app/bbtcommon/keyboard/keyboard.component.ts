import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { INavigableGroup } from '../../four-directional-navigation/navigable-group';

const keyboard = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '0'
];
const specialSet = [
  '~',
  '!',
  '@',
  '#',
  '$',
  '%',
  '^',
  '&',
  '*',
  '(',
  ')',
  '_',
  '+',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '0'
];
const keyboard_fr = ['é', 'è', 'ç', 'à', 'ë', 'ê'];
const keyboard_es = ['à', 'é', 'í', 'ñ', 'ó', 'ú', 'ü', '¿', '¡'];

export type keysets = 'uppercase' | 'lowercase' | 'symbols';

export class RowKeySet {
  public representativeChild: ElementRef = null;

  setRepresentativeChild(el: ElementRef) {
    this.representativeChild = el;
  }
}

@Component({
  selector: 'bbt-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.scss']
})
export class KeyboardComponent extends RowKeySet implements OnInit {
  keyboard: string[] = keyboard;
  keySet: keysets = 'lowercase';
  @Input() parentOverride: INavigableGroup;
  @Output() outputKey = new EventEmitter<string>();

  constructor(private changeDetectorRef: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    const locale = ($ as any).cookie('language');
    if (locale === 'es') this.keyboard = this.keyboard.concat(keyboard_es);
    if (locale === 'fr') this.keyboard = this.keyboard.concat(keyboard_fr);
  }

  upperCase() {
    this.keyboard = keyboard.map(function (x) {
      return x.toUpperCase();
    });
    this.keySet = 'uppercase';
  }
  lowerCase() {
    this.keyboard = keyboard;
    this.keySet = 'lowercase';
  }
  specialSet() {
    this.keyboard = specialSet;
    this.keySet = 'symbols';
  }
}
