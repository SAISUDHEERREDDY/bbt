import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'bbt-footer-navigation',
  templateUrl: './footer-navigation.component.html',
  styleUrls: ['./footer-navigation.component.scss']
})
export class FooterNavigationComponent implements OnInit {
  @Input()
  public bottomNavOpen = false;

  @Output()
  public hamburgerHit = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}
}
