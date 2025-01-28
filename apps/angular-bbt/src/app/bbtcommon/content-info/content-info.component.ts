import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { BaseFolder, Presentation, Video } from '../../content-model';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'bbt-content-info',
  templateUrl: './content-info.component.html',
  styleUrls: ['./content-info.component.scss']
})
export class ContentInfoComponent {
  @Input() content: Partial<Video & Presentation & BaseFolder>;

  locale$ = this.i18nService.currentLocale$;

  constructor(private i18nService: I18nService) {}
}
