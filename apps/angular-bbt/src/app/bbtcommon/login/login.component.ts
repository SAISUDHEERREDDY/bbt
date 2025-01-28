import {
  Component,
  EventEmitter,
  HostListener,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import { KeypadOutput } from '../keypad/keypad.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActiveService } from '../../four-directional-navigation/active.service';
import { INavigableGroup } from '../../four-directional-navigation/navigable-group';
import { INavigable } from '../../four-directional-navigation/navigable';
import { SafeKeyService } from '../safe-key.service';
import { MatDialogRef } from '@angular/material/dialog';
import { UserInputEvent } from '../UserInputEvent';

@Component({
  selector: 'bbt-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnDestroy {
  public passkey = new FormControl(null, [
    Validators.required,
    Validators.maxLength(4)
  ]);
  public authForm = new FormGroup({
    passkey: this.passkey
  });

  @Output() code = new EventEmitter<number>();

  @ViewChild('loginTrap', { static: true }) trap: INavigableGroup;

  constructor(
    private active: ActiveService,
    private safeKey: SafeKeyService,
    private dialogRef: MatDialogRef<any>
  ) {}

  submit(buffer = this.authForm.getRawValue().passkey) {
    if (buffer === null) return;
    this.code.emit(buffer);
    this.passkey.setValue(null);
  }

  clear() {
    this.passkey.setValue(null);
  }

  handleOutput(output: KeypadOutput) {
    const current: number = this.authForm.getRawValue().passkey;
    switch (output) {
      case 'decimal':
        break;
      case 'backspace':
        if (current === null) {
          break;
        }

        this.authForm.patchValue({
          passkey: this.filterPurposedNumber(Math.floor(current / 10))
        });

        break;
      // Handle numbers
      default:
        this.authForm.patchValue({
          passkey: this.filterPurposedNumber(
            current === null ? output : current * 10 + output
          )
        });

        break;
    }
  }

  /**
   * Checks if a number is valid
   * @param num number to check
   */
  private filterPurposedNumber(num: number) {
    if (num === null) return null;
    if (num === 0) return null;
    return num;
  }

  // Lifecycle hooks
  ngOnDestroy(): void {
    this.active.pop();
  }

  stealFocus(nav: INavigable) {
    this.active.push(nav);
    //this.active.pushAndSteal(nav);
    //nav.activate();
  }

  /**
   * helper to close the dialog
   * @param value The value to return
   */
  close(value = false) {
    this.dialogRef.close(value);
  }

  @HostListener('window:keydown', ['$event'])
  keydown($event: KeyboardEvent) {
    const key = this.safeKey.tryKeyNumber($event);

    // Handle non-numbers
    switch (key) {
      case UserInputEvent.Back:
      case 'e': // e is the key for the small remote
      case 'escape':
        this.dialogRef.close(false);
        break;
    }

    // Handle numbers
    if (typeof key === 'number') {
      this.handleOutput(key as number);
      return;
    }
  }
}
