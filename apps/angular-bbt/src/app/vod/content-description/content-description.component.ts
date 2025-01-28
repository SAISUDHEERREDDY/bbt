import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ContentPresentation, VideoContent } from '../../bbtcommon/content';
import { Presentation, Video } from '../../content-model';
import { I18nService } from '../../i18n/i18n.service';
import { Subscription, Unsubscribable } from 'rxjs';

@Component({
  selector: 'bbt-content-description',
  templateUrl: './content-description.component.html',
  styleUrls: ['./content-description.component.scss']
})
/**
 * ContentDescriptionComponent displays the content description of either a
 * presentation or a video
 */
export class ContentDescriptionComponent {
  @Input() content: Video | Presentation;
  @Input() parent: { name: string };
  @Input() audioTracks: string[];
  @Input() captions: string[];

  captionsString: string;

  locale$ = this.i18nService.currentLocale$;

  constructor(private i18nService: I18nService) {}

  /**
   * A helper to collect the captions from a piece of content
   * @param source
   * @private
   */
  private static collectCaptions(source: Video | Presentation): Set<string> {
    const caps = new Set<string>();
    if (source.type === 'Presentation') {
      for (const file of (source as Presentation).items) {
        for (const track of (file as Video).tracks) {
          caps.add(track.label);
        }
      }
    }

    return caps;
  }
}
