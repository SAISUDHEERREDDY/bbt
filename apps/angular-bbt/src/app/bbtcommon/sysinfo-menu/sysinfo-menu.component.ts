import { Component, OnInit, ViewChild, Input } from '@angular/core';

import { Sysinfo } from '../../sysinfo/sysinfo';
import { SysinfoService } from '../../sysinfo/sysinfo.service';

import { INavigable } from '../../four-directional-navigation/navigable';
import { INavigableGroup } from '../../four-directional-navigation/navigable-group';
import { ActiveService } from '../../four-directional-navigation/active.service';

@Component({
  selector: 'bbt-sysinfo-menu',
  templateUrl: './sysinfo-menu.component.html',
  styleUrls: ['./sysinfo-menu.component.scss']
})
export class SysinfoMenuComponent implements OnInit {
  //sysinfo: Sysinfo = { 'id': 0, 'name': "Lowes" };
  sysinfo: Sysinfo;

  @Input() parentNav: INavigableGroup;
  @Input() priority: number;

  /**
   * Menu targets for an easier ngFor
   */
  links = [
    {
      label: 'OVERVIEW',
      route: '/sysinfo/overview'
    },
    {
      label: 'NETWORK',
      route: '/sysinfo/network'
    },
    {
      label: 'STORAGE',
      route: '/sysinfo/storage'
    },
    {
      label: 'SUPPORT',
      route: '/sysinfo/support'
    }
  ];

  constructor(
    private sysinfoService: SysinfoService,
    private active: ActiveService
  ) {}

  ngOnInit(): void {
    this.getSysinfo();
  }

  getSysinfo(): void {
    this.sysinfoService
      .getSysinfo()
      .subscribe(sysinfo => (this.sysinfo = sysinfo));
  }

  @ViewChild('sideMenuStart') sideMenuStart: INavigable;

  // overviewSelected = true;
  // networkSelected = false;
  // storageSelected = false;
  // supportSelected = false;

  // // highlight the menu item and unhighlight other items
  // selectMenuItem(item: string): void {
  //   if (item === 'overview') {
  //     this.overviewSelected = true;
  //     this.networkSelected = false;
  //     this.storageSelected = false;
  //     this.supportSelected = false;
  //   } else if (item === 'network') {
  //     this.overviewSelected = false;
  //     this.networkSelected = true;
  //     this.storageSelected = false;
  //     this.supportSelected = false;
  //   } else if (item === 'storage') {
  //     this.overviewSelected = false;
  //     this.networkSelected = false;
  //     this.storageSelected = true;
  //     this.supportSelected = false;
  //   } else {
  //     this.overviewSelected = false;
  //     this.networkSelected = false;
  //     this.storageSelected = false;
  //     this.supportSelected = true;
  //   }
  // }

  focusSysinfoSideNav(nav: INavigable) {
    this.active.pushAndSteal(nav);
  }
}
