import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdleComponent } from './idle/idle.component';
import { RouterModule } from '@angular/router';
import { IdleModule } from '../idle/idle.module';
import { HlsPlyrComponent } from './hls-plyr/hls-plyr.component';
import { FourDirectionalNavigationModule } from '../four-directional-navigation/four-directional-navigation.module';
import { IdlePlayerComponent } from './idle/idle-player.component';

const routes = [
  {
    path: 'idle',
    component: IdleComponent
  }
];

@NgModule({
  declarations: [IdleComponent, IdlePlayerComponent, HlsPlyrComponent],
  exports: [HlsPlyrComponent, IdlePlayerComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    IdleModule,
    FourDirectionalNavigationModule
  ]
})
export class PlayersModule {}
