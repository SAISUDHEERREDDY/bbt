import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../../reducers';
import {
  FullscreenDisableAction,
  FullscreenEnableAction
} from '../../reducers/pseudoFullscreen/action';
import { Sysinfo } from '../../sysinfo/sysinfo';
import { SysinfoService } from '../../sysinfo/sysinfo.service';
import { NetTopService } from '../net-top/net-top.service';
import { I18nService } from '../../i18n/i18n.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActiveService } from '../../four-directional-navigation/active.service';
import { INavigableGroup } from '../../four-directional-navigation/navigable-group';
import { INavigable } from '../../four-directional-navigation/navigable';

import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';

import {
  MatSnackBar,
  MatSnackBarRef,
  TextOnlySnackBar
} from '@angular/material/snack-bar';

import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { NetIpComponent } from '../net-ip/net-ip.component';

interface Ethernet {
  interface: string;
  ipaddr: string;
  cidr: string;
  mask: string;
  macaddr: string;
  status: string;
  gwaddr?: string;
}

@Component({
  selector: 'bbt-net-top',
  templateUrl: './net-top.component.html',
  styleUrls: ['./net-top.component.scss']
})
export class NetTopComponent implements OnDestroy, OnInit {
  sysinfo: Sysinfo;
  netFocus: string;
  netBlur: string;
  ipModal = false;
  ipAddr: string;
  index: number;

  ethSettings: Ethernet;

  constructor(
    public i18nService: I18nService,
    private store: Store<ApplicationState>,
    private sysinfoService: SysinfoService,
    private netTopService: NetTopService,
    private i18n: I18nService,
    private snack: MatSnackBar,
    public dialog: MatDialog
  ) {
    this.store.dispatch(new FullscreenEnableAction());
  }

  snackRef: MatSnackBarRef<TextOnlySnackBar>;

  debugAlert(msg: string) {
    alert(msg);
  }

  ngOnInit() {
    this.getSysinfo();
    this.netFocus = '';
  }

  updateNetDevice(data: any, responseFunc: any): any {
    this.netTopService.updateNetDevice(data, responseFunc);
  }

  getSysinfo(): void {
    this.sysinfoService
      .getSysinfo()
      .subscribe(sysinfo => (this.sysinfo = sysinfo));
  }

  buttonFocus(event, iface) {
    this.netFocus = iface;
  }

  buttonBlur(event, iface) {
    this.netFocus = ''; // clear out
  }

  focusChildButton(id) {
    const btn = document.getElementById(id).focus();
  }

  openDialog(iface: string, addr: string, type: string): void {
    const modal = this.dialog.open(NetIpComponent, {
      disableClose: true,
      data: {
        iface: iface,
        addr: addr,
        type: type
      }
    });

    modal.afterClosed().subscribe(result => {
      if (result) {
        // figure out which bound variable to use
        let index = 0;
        for (; index < this.sysinfo.ethernet.length; index++) {
          console.log('index=' + index);
          if (this.sysinfo.ethernet[index].interface === iface) {
            this.ethSettings = Object.assign({}, this.sysinfo.ethernet[index]);
            if (type === 'addr') {
              this.ethSettings.ipaddr = result;
              // set ip address on the box for this net iface
            } else if (type === 'mask') {
              this.ethSettings.mask = result;
              // set the ip mask on the box for this net iface
            } else if (type === 'gw') {
              this.ethSettings.gwaddr = result;
              // set the ip gateway on the box for this net iface
            }
            this.updateNetDevice(this.ethSettings, response => {
              if (response.response === 'success') {
                this.sysinfo.ethernet[index] = Object.assign(
                  {},
                  this.ethSettings
                );
              } else {
                console.log('updateNetDevice Failed');
                this.snackRef = this.snack.open(
                  this.i18n.i18n('NET_SETTINGS_CHANGE_ERROR'),
                  '',
                  {
                    duration: 5000,
                    panelClass: ['snack-error']
                  }
                );
              }
            });

            break;
          }
        }
      }
    });
  }

  updateNetResponse() {}

  ngOnDestroy() {
    this.store.dispatch(new FullscreenDisableAction());
  }
}
