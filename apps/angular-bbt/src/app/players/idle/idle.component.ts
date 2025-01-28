import { Component, HostListener, ViewChild } from '@angular/core';
import { SafeKeyService } from '../../bbtcommon/safe-key.service';
import { IdlenessService } from '../../idle/idleness.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../../reducers';
import {
  FullscreenDisableAction,
  FullscreenEnableAction
} from '../../reducers/pseudoFullscreen/action';
import { HlsPlyrControlsOptions } from '../hls-plyr/hls-plyr.component';
import {
  PauseParkingInfo,
  ResumeParkingInfo
} from '../../reducers/parkingInfo/action';
import { BaseIdlePlayerDirective } from './BasicIdlePlayer.ts';
import { UserInputEvent } from '../../bbtcommon/UserInputEvent';

@Component({
  selector: 'bbt-idle',
  templateUrl: './idle.component.html'
})
export class IdleComponent extends BaseIdlePlayerDirective {
  @ViewChild('playerComponent') playerComponent;

  get player() {
    return this.playerComponent.player;
  }

  controls: HlsPlyrControlsOptions[] = [
    'captions',
    'progress',
    'current-time',
    'settings'
  ];

  constructor(
    private safeKey: SafeKeyService,
    private idle: IdlenessService,
    private router: Router,
    store: Store<ApplicationState>
  ) {
    super(store);
    this.store.dispatch(new FullscreenEnableAction());
    this.store.dispatch(new PauseParkingInfo());
  }

  @HostListener('window:keydown', ['$event'])
  keydown($event: KeyboardEvent) {
    // Is it important that the keydown event be used with the key property.
    // Do not change these things!
    switch (this.safeKey.tryKeyLowercase($event)) {
      case UserInputEvent.Home:
      case 'h':
      case 'escape':
        this.idle.noteInteraction();
        this.store.dispatch(new FullscreenDisableAction());
        this.store.dispatch(new ResumeParkingInfo());
        return this.router.navigate(['vod']);
      case UserInputEvent.FastForward:
      case 'f':
        this.player.forward();
        $event.preventDefault();
        $event.stopPropagation();
        break;
      case UserInputEvent.Rewind:
      case 'r':
        this.player.rewind();
        break;
      case UserInputEvent.TrackPrevious:
      case 'y':
        this.player.rewind(180);
        break;
      case UserInputEvent.TrackNext:
      case 'k':
        this.player.forward(180);
        break;
      case 'c':
        this.nextSubtitleTrack();
        $event.preventDefault();
        $event.stopPropagation();
        break;
    }
  }
}
