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

import * as Plyr from 'plyr';
import Hls from 'hls.js';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

export type HlsPlyrControlsOptions =
  | 'captions'
  | 'play-large'
  | 'progress'
  | 'current-time'
  | 'settings';

type EventCallback = (event: any) => boolean | void;

@Component({
  selector: 'bbt-hls-plyr',
  template: '<video #player></video>',
  exportAs: 'plyr'
})
export class HlsPlyrComponent implements AfterViewInit, OnChanges, OnDestroy {
  constructor() {}
  // Initial offset to the video in seconds
  @Input() initialOffset: number;

  @Input() m3u8Url: string;
  @Input() clickToPlay = false;
  @Input() controls: HlsPlyrControlsOptions[] = ['captions'];

  @Input() autoplay = true;
  @Input() loop = false;

  @Output() complete = new EventEmitter<'immediate' | 'played'>();
  @Output() ended = new EventEmitter<never>();
  @ViewChild('player', { static: true }) playerEl: ElementRef;
  public player: Plyr;
  public hls: Hls;
  public audio: any;
  private listeners = new Set<() => void>();

  private readonly onEnded = Object.bind(this.ended, this.ended.emit);
  private readonly onManifestParsed = () => {
    this.playerEl.nativeElement
      .play()
      .then(() => this.seekToTime(this.initialOffset))
      .catch(e => console.log(e.message));
  };

  spinupPlayer(url: string = this.m3u8Url) {
    if (!Hls.isSupported()) {
      this.playerEl.nativeElement.src = url;
    } else {
      this.hls = new Hls({
        maxBufferLength: 10,
        maxMaxBufferLength: 20
      });
      this.hls.loadSource(url);
      this.hls.attachMedia(this.playerEl.nativeElement);
      this.addOnOffListener(
        Hls.Events.MANIFEST_PARSED,
        this.onManifestParsed,
        this.hls
      );
    }
  }

  /**
   * Updates current time if the time exists and player exists
   * @param time  Time to seek to in seconds
   */
  private seekToTime(time = 0) {
    if (time && this.player && time > 0) {
      this.player.currentTime = time;
    }
  }

  /**
   * Sets the player track and delays to set hls track
   * @param i
   */
  private safeTrackSet(i: number) {
    this.player.currentTrack = i;

    setTimeout(() => {
      if (this.hls) {
        this.hls.subtitleTrack = i;
      }
    }, 50);
  }

  /**
   * Cycle through the captions track and disables captions when it rolls
   * around.
   */
  cycleToNextCaption() {
    if (!this.hls.subtitleTracks.length) {
      return; // If there are no audioTracks be done.
    }

    const lang = this.player.currentTrack;
    if (this.player.currentTrack === -1) {
      this.player.toggleCaptions(true);
      this.safeTrackSet(0);
    } else if (this.hls.subtitleTracks.length - 1 === lang) {
      this.safeTrackSet(0);
      this.player.toggleCaptions(false);
    } else {
      this.safeTrackSet(this.player.currentTrack + 1);
    }
  }

  /**
   * Composes plyr settings as described at:
   * https://github.com/sampotts/plyr#options
   */
  private composeSettings() {
    return {
      debug: Boolean(
        !environment.production && window && (window as any).plyrDebug
      ),
      autoplay: this.autoplay,
      controls: this.controls,
      keyboard: {
        global: false
      },
      clickToPlay: this.clickToPlay,
      loop: { active: this.loop },
      captions: {
        active: true,
        update: true
      }
    };
  }

  private onLoadedData() {
    if (this.initialOffset && this.initialOffset > 0) {
      if (this.player.duration < this.initialOffset) {
        this.player.stop();
        this.complete.emit('immediate');
        return;
      }
      this.seekToTime(this.initialOffset);
      const playAttempt = this.player.play();
      if ((playAttempt as Promise<void>).catch) {
        (playAttempt as Promise<void>).catch(e => console.log(e.message));
      }
    }
  }

  private readonly onLanguageChange = () => {
    // Caption support is still flaky.
    // See: https://github.com/sampotts/plyr/issues/994
    const sub = of()
      .pipe(delay(50))
      .subscribe(() => {
        if (this.hls) {
          this.hls.subtitleTrack = this.player.currentTrack;
        }
        sub.unsubscribe();
      });
  };

  /**
   * Helper function to pass through to renderer listen and track event behind
   * it. See https://angular.io/api/core/Renderer2#listen for original interface
   * @param eventName
   * @param callback
   * @param target
   */
  private addOnOffListener(
    eventName: string,
    callback: EventCallback,
    target: {
      on: (string, EventCallback) => boolean | void;
      off: (string, EventCallback) => boolean | void;
    }
  ) {
    target.on(eventName, callback);
    const destructor = () => target.off(eventName, callback);
    this.listeners.add(destructor);
    return destructor;
  }

  private onComplete() {
    this.complete.emit('played');
  }

  ngAfterViewInit() {
    this.player = new Plyr(this.playerEl.nativeElement, this.composeSettings());

    this.player.on('complete' as any, this.onComplete);
    this.addOnOffListener('loadeddata', this.onLoadedData, this.player);

    this.addOnOffListener('ended', this.onEnded, this.player);

    // Handle changing captions
    this.addOnOffListener('languagechange', this.onLanguageChange, this.player);

    if (!this.m3u8Url) return;
    this.spinupPlayer(this.m3u8Url);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { m3u8Url } = changes;
    if (m3u8Url && m3u8Url.currentValue !== m3u8Url.previousValue) {
      if (this.hls) {
        this.hls.destroy();
      }

      if (this.player) {
        this.spinupPlayer(m3u8Url.currentValue);
      }
    }

    if (changes.initialOffset && !changes.initialOffset.firstChange) {
      if (
        changes.initialOffset.currentValue &&
        changes.initialOffset.currentValue > 0 &&
        this.player
      ) {
        this.seekToTime(changes.initialOffset.currentValue);
      }
    }
  }

  ngOnDestroy(): void {
    // Kill listeners on player to avoid leaky memory
    this.player.off('complete' as any, this.onComplete);

    this.listeners.forEach(x => x());
    this.listeners.clear();

    this.hls.destroy();
    this.hls = null;
    this.player.destroy();
  }
}
