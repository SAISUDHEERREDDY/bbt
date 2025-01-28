import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LiveComponent } from './live/live.component';
import { RouterModule } from '@angular/router';
import { BBTCommonModule } from '../bbtcommon/bbtcommon.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import { I18nModule } from '../i18n/i18n.module';
import { PlayersModule } from '../players/players.module';
import { LiveDescriptionComponent } from './live-description/live-description.component';
import { ProgramBrowserComponent } from './program-browser/program-browser.component';
import { HlsModule } from '../hls/hls.module';
import { SharedComponentsModule } from '@bbt/shared';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FourDirectionalNavigationModule } from '../four-directional-navigation/four-directional-navigation.module';
import { LiveExitGuard } from './live-exit.guard';

@NgModule({
  declarations: [
    LiveDescriptionComponent,
    LiveComponent,
    ProgramBrowserComponent
  ],
  imports: [
    CommonModule,
    BBTCommonModule,
    FullCalendarModule,
    RouterModule.forChild([
      {
        path: '',
        component: LiveComponent,
        canDeactivate: [LiveExitGuard]
      }
    ]),
    I18nModule,
    PlayersModule,
    HlsModule,
    SharedComponentsModule,
    MatProgressSpinnerModule,
    FourDirectionalNavigationModule
  ],
  providers: [DatePipe]
})
export class LiveModule {}
