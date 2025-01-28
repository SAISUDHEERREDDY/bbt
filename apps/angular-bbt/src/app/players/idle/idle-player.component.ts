import { Component, ViewChild } from '@angular/core';
import { BaseIdlePlayerDirective } from './BasicIdlePlayer.ts';
import { HlsPlyrControlsOptions } from '../hls-plyr/hls-plyr.component';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../../reducers';

@Component({
  selector: 'bbt-idle-player',
  template: ` <bbt-hls-plyr
    *ngIf="video"
    (ended)="next()"
    [m3u8Url]="video"
    [controls]="controls"
    #playerComponent
  ></bbt-hls-plyr>`
})
export class IdlePlayerComponent extends BaseIdlePlayerDirective {
  controls: HlsPlyrControlsOptions[] = ['captions'];

  @ViewChild('playerComponent') playerComponent;

  get player() {
    return this.playerComponent.player;
  }

  constructor(store: Store<ApplicationState>) {
    super(store);
  }
}
