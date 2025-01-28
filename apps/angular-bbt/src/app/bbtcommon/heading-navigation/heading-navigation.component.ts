import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'bbt-heading-navigation',
  templateUrl: './heading-navigation.component.html',
  styleUrls: ['./heading-navigation.component.scss'],
  exportAs: 'topNav'
})
export class HeadingNavigationComponent {
  @Input()
  public sideNavOpen = false;

  @Output()
  public hamburgerHit = new EventEmitter();

  constructor() {}
}
