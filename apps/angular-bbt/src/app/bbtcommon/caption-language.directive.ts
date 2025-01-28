import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[bbtCaptionLanguage]'
})
export class CaptionLanguageDirective implements AfterViewInit, OnDestroy {
  private listeners = new Set<() => void>();

  private _languageCode: string;
  @Input('bbtCaptionLanguage')
  get languageCode() {
    return this._languageCode;
  }

  set languageCode(code: string) {
    this._languageCode = code;
    this.iterateTracks(track => {
      track.mode = track.language === code ? 'showing' : 'disabled';
    });
  }

  private get currentlyActiveTrack(): TextTrack {
    return this.iterateTracks(track => track.mode === 'showing');
  }

  constructor(
    private mediaElement: ElementRef<HTMLMediaElement>,
    private renderer: Renderer2
  ) {}

  /**
   * Iterates through all the tracks
   * @param fn  Callback function. If it returns true iteration stops and
   * returns that track.
   * @private
   */
  private iterateTracks(
    fn: (track: TextTrack, index: number) => boolean | void
  ): TextTrack {
    const tracks = this.mediaElement.nativeElement.textTracks;

    if (!tracks) {
      return;
    }

    // Manual iteration required since textTracks are not iterable
    for (let i = 0; i < tracks.length; i++) {
      const t = fn(tracks[i], i);
      if (t) {
        return tracks[i];
      }
    }

    return null;
  }

  /**
   * Finds the tracks currently set to active
   * @private
   */
  private findActiveTrack() {
    return this.iterateTracks(track => track.mode === 'showing');
  }

  // Angular Lifecycle Hooks
  ngAfterViewInit(): void {
    this.listeners.add(
      this.renderer.listen(
        this.mediaElement.nativeElement.textTracks,
        'addtrack',
        this.addTrackHandler.bind(this)
      )
    );

    this.listeners.add(
      this.renderer.listen(
        this.mediaElement.nativeElement.textTracks,
        'removetrack',
        this.removeTrackHandler.bind(this)
      )
    );
  }

  private addTrackHandler(e: TrackEvent) {
    if (e.track.language === this.languageCode) {
      const active = this.currentlyActiveTrack;
      if (active) {
        active.mode = 'disabled';
      }

      e.track.mode = 'showing';
      return;
    }

    e.track.mode = 'disabled';
  }

  private removeTrackHandler(e: TrackEvent) {
    if (e.track.mode === 'showing') {
      // Find new track to show
      const toActivate = this.iterateTracks(
        track => track.language === this.languageCode
      );

      if (toActivate) {
        toActivate.mode = 'showing';
      }
    }
  }

  ngOnDestroy(): void {
    this.listeners.forEach(x => x());
  }
}
