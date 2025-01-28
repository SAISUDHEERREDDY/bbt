import { Component, ViewEncapsulation, Input } from '@angular/core';

@Component({
  selector: 'shared-thumbnail-card',
  templateUrl: './thumbnail-card.component.html',
  styleUrls: ['./thumbnail-card.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ThumbnailCardComponent {
  _encodedThumbSrc?: string = undefined;

  /**
   * The url to assign for the thumbnail
   */
  @Input()
  set thumbSrc(val: string) {
    this._encodedThumbSrc = val ? `url('${val}')` : undefined;
  }
}
