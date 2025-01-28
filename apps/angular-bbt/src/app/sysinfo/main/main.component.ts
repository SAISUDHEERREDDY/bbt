import {
  Component,
  Injectable,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../../reducers';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FullscreenDisableAction,
  FullscreenEnableAction
} from '../../reducers/pseudoFullscreen/action';
import { Sysinfo } from '../sysinfo';
import { SysinfoService } from '../sysinfo.service';
import { ActiveService } from '../../four-directional-navigation/active.service';
import { INavigableGroup } from '../../four-directional-navigation/navigable-group';
import { INavigable } from '../../four-directional-navigation/navigable';

@Component({
  selector: 'bbt-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnDestroy, OnInit {
  sysinfo: Sysinfo;

  ngOnInit(): void {
    this.getSysinfo();
    //alert("Main ngOnInit");
    console.log('Main ngOnInit');
    this.router.navigate(['/sysinfo/overview']);
  }

  // onOutletLoaded(component) {
  //   //alert("In onOutletLoaded");
  //   component.sysinfo = this.sysinfo;
  //   //console.log(component.sysinfo);
  //   //alert("component.sysinfo=" + component.sysinfo);
  // }

  getSysinfo(): void {
    this.sysinfoService
      .getSysinfo()
      .subscribe(
        sysinfo => (
          (this.sysinfo = sysinfo),
          this.sysinfoService.setSysinfoData(this.sysinfo)
        )
      );
    // .subscribe(sysinfo => (this.sysinfo = sysinfo));
    // this.sysinfoService.setSysinfoData(this.sysinfo);
  }

  @ViewChild('sysinfoTrap', { static: true }) trap: INavigableGroup;

  constructor(
    private active: ActiveService,
    private store: Store<ApplicationState>,
    private router: Router,
    private route: ActivatedRoute,
    private sysinfoService: SysinfoService
  ) {
    this.store.dispatch(new FullscreenEnableAction());
  }

  ngOnDestroy() {
    this.store.dispatch(new FullscreenDisableAction());
  }
}
