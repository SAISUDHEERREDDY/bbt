import { Component, Injectable, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../../reducers';
import {
  FullscreenDisableAction,
  FullscreenEnableAction
} from '../../reducers/pseudoFullscreen/action';
import { ActivatedRoute } from '@angular/router';
import { Sysinfo } from '../../sysinfo/sysinfo';
import { SysinfoService } from '../sysinfo.service';
import { I18nService } from '../../i18n/i18n.service';

//@Injectable
@Component({
  selector: 'bbt-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.scss']
})
export class NetworkComponent implements OnInit, OnDestroy {
  sysinfo: Sysinfo;
  ping: boolean;

  constructor(
    public i18nService: I18nService,
    private store: Store<ApplicationState>,
    private route: ActivatedRoute,
    private sysinfoService: SysinfoService,
    private i18n: I18nService
  ) {
    this.store.dispatch(new FullscreenEnableAction());
  }

  ngOnInit() {
    this.ping = false;
    this.getSysinfo();
    // this.ping = (this.sysinfo.gateway.ping.match(/ ms$/) !== null);
  }

  getSysinfo(): void {
    this.sysinfo = this.sysinfoService.getSysinfoCache();
  }

  manageNetwork(): void {
    alert('manageNetwork ENTERED');
  }

  ngOnDestroy() {
    this.store.dispatch(new FullscreenDisableAction());
  }
}
