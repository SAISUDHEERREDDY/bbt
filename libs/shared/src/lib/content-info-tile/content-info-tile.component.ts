import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'shared-content-info-tile',
  templateUrl: './content-info-tile.component.html',
  styleUrls: ['./content-info-tile.component.scss']
})
export class ContentInfoTileComponent {
  /**
   * The itemId of the content
   */
  @Input() itemId?: number;
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
  @Input() type?: 'folder' | 'Video' | 'doc' | 'presentation';

  /**
   * Secondary information to show on the bottom row
   */
  @Input() info?: string;

  /**
   * Translated edit string
   */
  @Input() edit?: string;

  /**
   * Translated delete string
   */
  @Input() del?: string;

  @Output()
  update = new EventEmitter<string>();
  @Output()
  delete = new EventEmitter<string>();

  deleteClicked() {
    this.delete.emit(this.itemId?.toString());
  }

  updateClicked() {
    this.update.emit(this.itemId?.toString());
  }
}
