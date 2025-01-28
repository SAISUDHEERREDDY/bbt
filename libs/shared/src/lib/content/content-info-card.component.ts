import { Component, Input } from '@angular/core';

@Component({
  selector: 'shared-content-info-card',
  templateUrl: './content-info-card.component.html',
  styleUrls: ['./content-info-card.component.scss']
})
export class ContentInfoCardComponent {
  /**
   * The main text to display
   */
  @Input() name?: string;

  /**
   * The url to assign for the thumbnail
   */
  @Input() thumbSrc?: string;

  /**
   * The type used exclusively to set the icon
   */
  @Input() type?: 'Video' | 'Folder' | 'Presentation';

  /**
   * Secondary information to show on the bottom row
   */
  @Input() info?: string;

  /**
   * Weither or not to show the locked icon
   */
  @Input() passkey?: boolean;

  /**
   * Returns true if it has subtitles
   */
  @Input() hasSubs?: boolean;
}
