import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { BBTCommonModule } from './bbtcommon/bbtcommon.module';
import { FourDirectionalNavigationModule } from './four-directional-navigation/four-directional-navigation.module';
import { LocalContentModule } from './local-content/local-content.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { I18nModule } from './i18n/i18n.module';
import { StoreModule } from '@ngrx/store';
import { reducers } from './reducers';
import { environment } from '../environments/environment';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { AppEffects } from './app.effects';
import { VODListingEffects } from './reducers/VODListing/effects';
import { ParkingInfoEffects } from './reducers/parkingInfo/effects';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { IdleModule } from './idle/idle.module';
import { HttpClientModule } from '@angular/common/http';
import { VODListingState } from './reducers/VODListing/state';
import * as live from './reducers/live/live.reducer';
import { LiveEffects } from './reducers/live/live.effects';

import { LoginService } from './bbtcommon/service/login.service';
import { SysinfoModule } from './sysinfo/sysinfo.module';
import { ConfigModule } from './config/config.module';
import { I18nService } from './i18n/i18n.service';
import { IdleMessageEffects } from './reducers/idleMessage/idle-message.effects';
import { ConfigService } from './services/config.service';

const VODListing: VODListingState = {
  selectedContent: null,
  page: null,
  categories: [],
  id: null,
  name: null,
  categoriesState: undefined
};
export function initializeApp(configService: ConfigService): () => Promise<void> {
  return () => configService.loadConfig();
}
const devModules = environment.production
  ? []
  : [
      StoreDevtoolsModule.instrument({
        maxAge: 100,
        logOnly: environment.production
      })
    ];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BBTCommonModule,
    IdleModule,
    RouterModule.forRoot(
      [
        {
          path: '',
          redirectTo: 'vod/root/menu/none/selection',
          pathMatch: 'full'
        },
        {
          path: 'vod',
          loadChildren: () =>
            import(/* webpackChunkName: "vod" */ './vod/vod.module').then(
              mod => mod.VODModule
            )
        },
        {
          path: 'live',
          loadChildren: () =>
            import(/* webpackChunkName: "live" */ './live/live.module').then(
              mod => mod.LiveModule
            )
        },
        {
          path: 'player',
          loadChildren: () =>
            import(
              /* webpackChunkName: "players" */ './players/players.module'
            ).then(mod => mod.PlayersModule)
        },
        {
          path: 'search',
          loadChildren: () =>
            import(
              /* webpackChunkName: "search" */ './search/search.module'
            ).then(x => x.SearchModule)
        }
      ],
      {
        initialNavigation: 'enabled',
        relativeLinkResolution: 'legacy'
      }
    ),
    LocalContentModule,
    SysinfoModule,
    ConfigModule,
    BrowserAnimationsModule,
    FourDirectionalNavigationModule,
    I18nModule,
    HttpClientModule,

    // Redux
    StoreModule.forRoot(reducers, {
      initialState: {
        parkingInfo: { enabled: false, paused: false, screenTimeout: 60 },
        pseudoFullscreen: { enabled: false },
        VODListing,
        live: live.initialState
      }
    }),
    EffectsModule.forRoot([
      AppEffects,
      VODListingEffects,
      ParkingInfoEffects,
      LiveEffects,
      IdleMessageEffects
    ]),

    // Material
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,

    // Debug only dev modules
    ...devModules
  ],
  providers: [
    LoginService,
    ConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp, // Initialization function
      deps: [ConfigService],     // Inject ConfigService
      multi: true,               // Ensures multiple initializers can run
    },
    //MatDialogRef
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(matIconRegistry: MatIconRegistry, i18nService: I18nService) {
    matIconRegistry.registerFontClassAlias('fa');
    i18nService.load().catch(console.error);
  }
}
