import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { VODPlayback } from '../VODPlayback';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../../reducers';
import { SafeKeyService } from '../../bbtcommon/safe-key.service';
import { ActiveService } from '../../four-directional-navigation/active.service';
import { AutoplayPermittedService } from '../../bbtcommon/autoplay-permitted.service';
import { ContentOverlayModalService } from '../content-overlay-modal.service';
import { Unsubscribable } from 'rxjs';
import { IdlenessService } from '../../idle/idleness.service';
import { CrossMessageService } from '../../bbtcommon/cross-message.service';

@Component({
  selector: 'bbt-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['../playback.less', './video-player.component.less']
})
export class VideoPlayerComponent
  extends VODPlayback
  implements OnInit, OnDestroy, AfterViewInit
{
  private subscriptions = new Set<Unsubscribable>();

  constructor(
    route: ActivatedRoute,
    store: Store<ApplicationState>,
    router: Router,
    safeKey: SafeKeyService,
    active: ActiveService,
    autoplayPermitted: AutoplayPermittedService,
    contentOverlayService: ContentOverlayModalService,
    private idle: IdlenessService,
    private crossMessageService: CrossMessageService
  ) {
    super(
      store,
      active,
      route,
      router,
      safeKey,
      contentOverlayService,
      autoplayPermitted
    );
  }

  // Handling for vidPlayer
  @ViewChild('player') set player(e: ElementRef<HTMLVideoElement>) {
    this._vidPlayer = e;

    this.bindProgress();
  }
  get player() {
    return this._vidPlayer;
  }

  private _vidPlayer: ElementRef<HTMLVideoElement>;

  // Nothing extra for opening video overlay
  openOverlay = this.createOverlay.bind(this);

  @HostListener('window:keydown', ['$event'])
  async keydown($event: KeyboardEvent) {
    const key = this.safeKey.tryKeyLowercase($event);
    const handledGenerically = await this.handleKeydown($event, key);
    if (handledGenerically) return;

    // Handle video playback specific cases
    if (!this.overlayIsOpen()) {
      switch (key) {
        case 'arrowleft':
          this.skipBackward();
          return;
        case 'arrowright':
          this.skipForward();
          return;
      }
    }
  }

  // Angular lifecycle hooks
  ngOnInit() {
   
    this.pauseIdleness();
  }

  ngAfterViewInit() {
    this.file$.subscribe(file => {
      console.log('Current file from store:', file);
    });
    // If the video is ready to be played right away play it
    if (this.player?.nativeElement?.readyState > 3) {
      this.safePlay();
    }
  }

  pauseIdleness() {
    this.idle.pause();
    const el = this.player?.nativeElement;
    const time = Math.floor((el?.duration - el?.currentTime) * 1000);
    this.crossMessageService.expectIdle(isNaN(time) ? undefined : time);
  }

  resumeIdleness() {
    this.idle.resume();
    this.crossMessageService.cancelExpectIdle();
  }

  ngOnDestroy(): void {
    this.resumeIdleness();
    this.dispose();
    this.subscriptions.forEach(x => x.unsubscribe());
  }
}
