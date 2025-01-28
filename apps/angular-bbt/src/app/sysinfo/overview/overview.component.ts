import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Store } from '@ngrx/store';
import { ApplicationState } from '../../reducers';
import {
  FullscreenDisableAction,
  FullscreenEnableAction
} from '../../reducers/pseudoFullscreen/action';
import { Sysinfo } from '../sysinfo';
import { SysinfoService } from '../sysinfo.service';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'bbt-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit, OnDestroy {
  sysinfo: Sysinfo;

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
    console.log('Overview ngOnInit New');
    this.getSysinfo();
  }

  getSysinfo(): void {
    this.sysinfo = this.sysinfoService.getSysinfoCache();
  }

  formatInstalled(dateStr): string {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const minute = dateStr.substring(10, 12);
    const second = dateStr.substring(12, 14);
    const date = new Date(year, month - 1, day, hour, minute, second);
    const dateParts = date.toDateString().split(/ /);
    let tdate = date.toLocaleString();
    tdate = tdate.replace(/\S* /, ''); // removes date portion, just want time
    tdate = tdate.replace(/:\S\S /, ' ');
    return (
      dateParts[1] + ' ' + dateParts[2] + ', ' + dateParts[3] + ' ' + tdate
    );
  }

  ngOnDestroy() {
    this.store.dispatch(new FullscreenDisableAction());
  }
}
