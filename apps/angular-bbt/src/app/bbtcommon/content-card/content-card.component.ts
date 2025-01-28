import { Component, Input } from '@angular/core';
import { SecondsByMagnitudePipe } from '@bbt/shared';
import { BaseFolder, Presentation, Video } from '../../content-model';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'bbt-content-card',
  templateUrl: './content-card.component.html',
  styleUrls: ['./content-card.component.scss']
})
export class ContentCardComponent {
  @Input() content: Partial<Video & BaseFolder & Presentation> & {
    count?: number;
    customIcon?: string;
  };

  locale$ = this.i18nService.currentLocale$;

  private secondsByMagnitudePipe = new SecondsByMagnitudePipe();

  private items = this.i18nService.translate('Items');

  // A helper property for complex type transformations on the info
  get info() {
    switch (this.content?.type as string) {
      case 'Folder':
        if (this.content?.count === undefined || this.content?.count === null) {
          return undefined;
        }

        return `${this.content?.count} ${this.items}`;
      case 'Video':
        return this.secondsByMagnitudePipe
          .transform(this.content?.duration)
          .toString();
    }

    return undefined;
  }

  constructor(private i18nService: I18nService) {}
}
