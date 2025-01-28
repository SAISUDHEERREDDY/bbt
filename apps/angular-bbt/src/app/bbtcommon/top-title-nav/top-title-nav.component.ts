import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'bbt-top-title-nav',
  templateUrl: './top-title-nav.component.html',
  styleUrls: ['./top-title-nav.component.scss']
})
export class TopTitleNavComponent implements OnInit {
  @Input() link = '../selection';
  /**
   * By default the back button will be display pass false to hide it
   */
  @Input() displayBackButton: boolean;

  /**
   * If no title provided it will be omitted
   */
  @Input() title: string | null;

  /**
   * By default image will be display
   */
  @Input() displayImage: boolean | null;
  /**
   * Provide new path for a non-default image
   */
  @Input() imagePath = '/assets/images/HD-logo.png';

  backClicked() {
    if (this._location) {
      this._location.back();
    }
  }

  constructor(private _location: Location) {}

  ngOnInit() {}
}
