import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { environment } from '../../../environments/environment';
import * as Plyr from 'plyr';
import { Options as PlryOptions } from 'plyr';
import { Track } from '../content';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'bbt-plyr',
  template: '<video #player></video>',
  exportAs: 'plyr'
})
export class PlyrComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('player', { static: true }) playerEl: ElementRef;
  public player: Plyr;

  @Input() source;
  @Input() loop = false;
  @Input() controls = [
    'play-large',
    'progress',
    'current-time',
    'captions',
    'settings'
  ];
  @Input() tracks: Track[] = [];

  // Initial offset to the video in seconds
  @Input() initialOffset: number;

  @Input() autoplay = true;

  @Output() complete = new EventEmitter<'immediate' | 'played'>();
  @Output() ended = new EventEmitter<never>();

  constructor(private i18nService: I18nService) {}

  /**
   * Composes plyr settings as described at:
   * https://github.com/sampotts/plyr#options
   */
  private composeSettings(): PlryOptions {
    return {
      debug: Boolean(
        !environment.production && window && (window as any).plyrDebug
      ),
      autoplay: this.autoplay,
      controls: this.controls,
      keyboard: {
        global: false
      },
      clickToPlay: false,
      loop: { active: this.loop },
      captions: {
        active: Boolean(this.tracks && this.tracks.length),
        language: this.i18nService.i18n().locale
      }
    };
  }

  /**
   * Composes plyr source objects as described at:
   * https://github.com/sampotts/plyr#the-source-setter
   */
  private composeSource(): any {
    return {
      type: 'Video',
      sources: [
        {
          src: this.source,
          type: 'video/mp4'
        }
      ],
      tracks: this.tracks
    };
  }

  ngAfterViewInit() {
    this.player = new Plyr(this.playerEl.nativeElement, this.composeSettings());
    this.player.source = this.composeSource();

    this.player.on('loadeddata', () => {
      if (this.initialOffset && this.initialOffset > 0) {
        if (this.player.duration < this.initialOffset) {
          this.player.stop();
          this.complete.emit('immediate');
          return;
        }
        this.player.currentTime = this.initialOffset;
        this.player.play();
      }
    });
    this.player.on('complete' as any, () => {
      this.complete.emit('played');
    });
    this.player.on('ended', () => {
      this.ended.emit();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.source && !changes.source.firstChange) {
      if (changes.source.currentValue) {
        this.player.source = this.composeSource();
      }
    }

    if (changes.tracks && !changes.tracks.firstChange) {
      if (changes.tracks.currentValue) {
        (this.player as any).tracks.active =
          changes.tracks.currentValue && changes.tracks.currentValue.length > 0;
      }
    }

    if (changes.initialOffset && !changes.initialOffset.firstChange) {
      if (
        changes.initialOffset.currentValue &&
        changes.initialOffset.currentValue > 0 &&
        this.player
      ) {
        this.player.currentTime = changes.initialOffset.currentValue;
      }
    }
  }

  ngOnDestroy(): void {
    if (this.player) {
      this.player.destroy();
    }
  }
}
