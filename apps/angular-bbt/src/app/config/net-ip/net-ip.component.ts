import {
  Component,
  OnInit,
  EventEmitter,
  HostListener,
  OnDestroy,
  Output,
  ViewChild,
  Inject
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActiveService } from '../../four-directional-navigation/active.service';
import { INavigableGroup } from '../../four-directional-navigation/navigable-group';
import { INavigable } from '../../four-directional-navigation/navigable';
import { SafeKeyService } from '../../bbtcommon/safe-key.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { KeypadOutput } from '../../bbtcommon/keypad/keypad.component';
import { UserInputEvent } from '../../bbtcommon/UserInputEvent';
import { I18nService } from '../../i18n/i18n.service';

import {
  MatSnackBar,
  MatSnackBarRef,
  TextOnlySnackBar
} from '@angular/material/snack-bar';

export interface DialogData {
  iface: string;
  addr: string;
  type: string;
}

@Component({
  selector: 'bbt-net-ip',
  templateUrl: './net-ip.component.html',
  styleUrls: [
    '../../bbtcommon/login/login.component.scss',
    './net-ip.component.scss'
  ]
})
export class NetIpComponent implements OnInit, OnDestroy {
  public ipAddr = new FormControl(null, [
    Validators.required,
    Validators.maxLength(15),
    Validators.pattern(
      '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
    )
  ]);

  public ipForm = new FormGroup({
    ipAddr: this.ipAddr
  });

  snackRef: MatSnackBarRef<TextOnlySnackBar>;

  @Output() code = new EventEmitter<number>();

  @ViewChild('netcfgTrap', { static: true }) trap: INavigableGroup;

  constructor(
    private active: ActiveService,
    private safeKey: SafeKeyService,
    private snack: MatSnackBar,
    private dialogRef: MatDialogRef<NetIpComponent>,
    private i18n: I18nService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  submit(buffer = this.ipForm.getRawValue().ipAddr) {
    console.log('submit, ip=' + buffer);
    console.log(this.ipAddr.errors);
    if (this.ipAddr.errors) {
      this.snackRef = this.snack.open(this.i18n.i18n('INCORRECT_IP_ADDR'), '', {
        duration: 5000,
        panelClass: ['snack-error']
      });
    } else {
      this.dialogRef.close(this.data.addr);
    }
    this.ipAddr.setValue(null);
  }

  clearIp() {
    this.ipForm.patchValue({ ipAddr: null });
  }

  handleOutput(output: KeypadOutput) {
    const current: string = this.ipForm.getRawValue().ipAddr;

    switch (output) {
      case 'decimal':
        this.ipForm.patchValue({ ipAddr: current + '.' });
        break;
      case 'clear':
        this.ipForm.patchValue({ ipAddr: null });
        break;
      case 'backspace':
        if (current === null) {
          break;
        }

        if (current === '0') {
          this.ipForm.patchValue({ ipAddr: null });
          break;
        }

        this.ipForm.patchValue({ ipAddr: current.slice(0, -1) });

        break;
      default:
        if (current === null || current.toString().length < 15) {
          this.ipForm.patchValue({
            ipAddr: current === null ? output : current + output.toString()
          });
        }

        break;
    }
  }

  // Lifecycle hooks
  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.active.pop();
  }

  stealFocus(nav: INavigable) {
    this.active.pushAndSteal(nav);
    nav.activate();
  }

  @HostListener('window:keydown', ['$event'])
  keydown($event: KeyboardEvent) {
    const key = this.safeKey.tryKeyNumber($event);

    // Handle non-numbers
    switch (key) {
      case UserInputEvent.Back:
      case 'escape':
        this.dialogRef.close(false);
        break;
      case '.':
        this.handleOutput('decimal' as KeypadOutput);
        break;
      case 'backspace':
        this.handleOutput('backspace');
        break;
    }

    // Handle numbers
    if (typeof key === 'number') {
      this.handleOutput(key as number);
      return;
    }
  }
}
