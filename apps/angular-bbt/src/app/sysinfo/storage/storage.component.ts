import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../../reducers';
import {
  FullscreenDisableAction,
  FullscreenEnableAction
} from '../../reducers/pseudoFullscreen/action';
import { ActivatedRoute } from '@angular/router';
import { Sysinfo } from '../../sysinfo/sysinfo';
import { I18nService } from '../../i18n/i18n.service';
import { SysinfoService } from '../sysinfo.service';
import { ActiveService } from '../../four-directional-navigation/active.service';
import { INavigable } from '../../four-directional-navigation/navigable';

//@Injectable
@Component({
  selector: 'bbt-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.scss']
})
export class StorageComponent implements OnInit, OnDestroy {
  constructor(
    public i18nService: I18nService,
    private store: Store<ApplicationState>,
    private route: ActivatedRoute,
    private sysinfoService: SysinfoService,
    private active: ActiveService,
    private i18n: I18nService
  ) {
    this.store.dispatch(new FullscreenEnableAction());
  }

  sysinfo: Sysinfo;

  ngOnInit() {
    this.getSysinfo();
  }

  getSysinfo(): void {
    this.sysinfo = this.sysinfoService.getSysinfoCache();

    let size = '';
    let available = '';
    this.sysinfo.filesystem.forEach(disk => {
      if (!disk.size.match(/([MGT]B)/)) {
        size = disk.size.replace(/([MGT])/, ' $1B');
        available = disk.available.replace(/([MGT])/, ' $1B');
        disk.size = size;
        disk.available = available;
      }
      console.log(
        'Replace iteration, size=' + disk.size + ', available=' + disk.available
      );
    });
    console.log('getSysinfo FINISHED');
  }

  stealFocus(nav: INavigable) {
    this.active.pushAndSteal(nav);
    nav.activate();
  }

  ngOnDestroy() {
    this.store.dispatch(new FullscreenDisableAction());
  }
}
