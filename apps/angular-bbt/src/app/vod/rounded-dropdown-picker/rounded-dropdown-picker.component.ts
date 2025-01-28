import {
  ChangeDetectorRef,
  Component,
  forwardRef,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
  OnInit
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { INavigableGroup } from '../../four-directional-navigation/navigable-group';
import { ActiveService } from '../../four-directional-navigation/active.service';
import { INavigable } from '../../four-directional-navigation/navigable';
import { SafeKeyService } from '../../bbtcommon/safe-key.service';
import { UserInputEvent } from '../../bbtcommon/UserInputEvent';
import { I18nService } from '../../i18n/i18n.service';
import { Subscription, Unsubscribable } from 'rxjs';

@Component({
  selector: 'bbt-rounded-dropdown-picker',
  templateUrl: './rounded-dropdown-picker.component.html',
  styleUrls: ['./rounded-dropdown-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RoundedDropdownPickerComponent),
      multi: true
    }
  ]
})
export class RoundedDropdownPickerComponent
  implements ControlValueAccessor, OnChanges
{
  isOpen = false;
  isDisabled = false;

  _onChanges: any;
  _onTouched: any;

  /**
   * The content currently selected in the dropdown
   */
  selected: any;

  @Input()
  /**
   * Input to indicate an option for none should be included.
   */
  includeNone: boolean;

  @Input()
  /**
   * The options to be displayed in the dropdown
   */
  options: Iterable<any>;
  _options: any[];

  @Input()
  /**
   * The property on the option to be displayed. If unset it will be assumed
   * that the option toString value is acceptable.
   */
  labelProperty: string;

  @Input()
  parent: INavigableGroup;

  trapped = false;

  langSet: boolean = false;

  constructor(
    private active: ActiveService,
    private changeDetectorRef: ChangeDetectorRef,
    private safeKey: SafeKeyService,
    private i18nService: I18nService
  ) {}

  ngOnInit(): void {
    this.i18nService.load().then(() => {
      this.langSet = true;
    });
  }

  // ControlValueAccessor Methods
  registerOnChange(fn: any): void {
    this._onChanges = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  writeValue(obj: any): void {
    this.selected = obj;
  }

  // ControlValueAccessor helpers
  /**
   * Invokes onChanges if it is a function
   * @param change
   */
  safeOnChanges(change) {
    if (typeof this._onChanges === 'function') {
      this._onChanges(change);
    }
  }

  /**
   * Invokes onTouched if it is a function
   * @param change
   */
  safeOnTouched(change) {
    if (typeof this._onTouched === 'function') {
      this._onTouched(change);
    }
  }

  // State changing methods
  /**
   * Selects and options and closes the menu
   * @param option
   * @param $event  raw event to cancel if available
   */
  selectOption(option: any, $event: any = null) {
    if ($event) {
      $event.preventDefault();
      $event.stopPropagation();
    }

    this.selected = option;
    this.bailOut();
    this.safeOnChanges(this.selected);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const options = changes['options']?.currentValue;
    if (options) {
      this._options = [...options];
    }
  }

  focusOptionsTrap(nav: INavigable) {
    this.active.pushAndSteal(nav);
    this.trapped = true;
  }

  bailOut($event = null) {
    if ($event) {
      $event.preventDefault();
      $event.stopPropagation();
    }

    this.isOpen = false;
    if (this.trapped) {
      this.active.activatePrevious();
      this.trapped = false;
    }
    this.changeDetectorRef.detectChanges();
  }

  toggleOpen() {
    if (this.isOpen) {
      this.bailOut();
      return;
    }

    this.isOpen = true;
  }

  // Event Handlers
  @HostListener('keydown', ['$event'])
  keydown($event: KeyboardEvent) {
    const key = this.safeKey.tryKeyLowercase($event);

    if (key === 'enter') {
      this.toggleOpen();
    }

    if (this.isOpen && (key === 'escape' || key === UserInputEvent.Back)) {
      this.swallowEvent($event);
      this.bailOut();
    }
  }

  swallowEvent($event: any = null) {
    if ($event) {
      $event.preventDefault();
      $event.stopPropagation();
    }
  }
}
