import { OnDestroy, OnInit, Directive } from '@angular/core';
import { HlsPlyrControlsOptions } from '../hls-plyr/hls-plyr.component';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../../reducers';
import { parkingFiles } from '../../reducers/parkingInfo/selectors';
import { tap } from 'rxjs/operators';
import { sample } from 'lodash';
import { Unsubscribable } from 'rxjs';

@Directive()
export abstract class BaseIdlePlayerDirective implements OnDestroy, OnInit {
  abstract controls: HlsPlyrControlsOptions[];
  abstract playerComponent;
  abstract player;

  public videos: string[];
  public video: string;

  protected constructor(protected store: Store<ApplicationState>) {}

  private subs = new Set<Unsubscribable>();

  next() {
    const oldVid = this.video;
    this.video = sample(this.videos);

    // Restart the video if it is the same
    if (this.video === oldVid) {
      this.player.restart();
      this.player.play();
    }
  }

  nextSubtitleTrack() {
    const lang = this.player.currentTrack;
    if (this.playerComponent.tracks.length - 1 === lang) {
      this.player.currentTrack = 0;
      this.player.toggleCaptions();
    } else {
      this.player.currentTrack += 1;
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(x => x.unsubscribe());
  }

  ngOnInit(): void {
    this.subs.add(
      this.store
        .select(parkingFiles)
        .pipe(
          tap(x => (this.videos = x)),
          tap(
            () => (this.video = this.videos.length ? sample(this.videos) : null)
          )
        )
        .subscribe()
    );
  }
}
