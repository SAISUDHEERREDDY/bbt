import { Component, OnInit, Input } from '@angular/core';

import {
  BreakpointObserver,
  BreakpointState,
  Breakpoints
} from '@angular/cdk/layout';

@Component({
  selector: 'shared-title-bar',
  templateUrl: './title-bar.component.html',
  styleUrls: ['./title-bar.component.scss']
})
export class TitleBarComponent implements OnInit {
  @Input() show = false;
  @Input() showIfMobile = false;

  constructor(public breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    this.breakpointObserver
      .observe([
        Breakpoints.Small,
        Breakpoints.HandsetPortrait,
        Breakpoints.XSmall
      ])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          console.log(
            'Matches xsmall viewport, small viewport or handset in portrait mode'
          );
          this.showIfMobile = true;
        } else {
          this.showIfMobile = false;
        }
      });
  }
}
