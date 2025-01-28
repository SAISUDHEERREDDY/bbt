import { Component, Injectable, OnInit, OnDestroy } from '@angular/core';
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
  selector: 'bbt-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit, OnDestroy {
  constructor(
    public i18nService: I18nService,
    private store: Store<ApplicationState>,
    private sysinfoService: SysinfoService
  ) {
    this.store.dispatch(new FullscreenEnableAction());
  }

  sysinfo: Sysinfo;

  ngOnInit() {
    this.getSysinfo();
  }

  getSysinfo(): void {
    this.sysinfo = this.sysinfoService.getSysinfoCache();
  }

  ngOnDestroy() {
    this.store.dispatch(new FullscreenDisableAction());
  }
}
