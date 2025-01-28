import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentListingComponent } from './content-listing/content-listing.component';
import { RouterModule } from '@angular/router';
import { BBTCommonModule } from '../bbtcommon/bbtcommon.module';
import { HttpClientModule } from '@angular/common/http';
import { FourDirectionalNavigationModule } from '../four-directional-navigation/four-directional-navigation.module';
import { VideoLoginComponent } from './video-login/video-login.component';
import { I18nModule } from '../i18n/i18n.module';
import { ContentLandingMenuComponent } from './content-landing-menu/content-landing-menu.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PresentationComponent } from './presentation/presentation.component';
import { PresentationCardComponent } from './presentation-card/presentation-card.component';

import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ContentResolver } from './ContentResolver';
import { DirectoryGuard } from './DirectoryGuard';
import { RouterExtensionModule } from '../router-extension/router-extension.module';
import { ContentModelModule } from '../content-model/content-model.module';
import { PlayersModule } from '../players/players.module';
import { ContentDescriptionComponent } from './content-description/content-description.component';
import { RoundedDropdownPickerComponent } from './rounded-dropdown-picker/rounded-dropdown-picker.component';
import { PresentationVideoOverlayComponent } from './presentation-video-overlay/presentation-video-overlay.component';
import { VODOptionsBarComponent } from './vodoptions-bar/vodoptions-bar.component';
import { PresentationThumbsComponent } from './presentation-thumbs/presentation-thumbs.component';
import { LinearProgressComponent } from './linear-progress/linear-progress.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { VideoPlayerComponent } from './video-player/video-player.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedComponentsModule } from '@bbt/shared';
import { HlsModule } from '../hls/hls.module';
import { PanningModule } from '../panning/panning.module';
import { CategorySliderComponent } from './category-slider/category-slider.component';
import { ArrowNavigationDirective } from '../directives/arrow-navigation.directive';

const routes = [
  {
    path: '',
    redirectTo: 'root/menu/none/selection',
    pathMatch: 'full'
  },
  // This route is included because for a long time it was the route defaulted
  // to and other applications (notably the HSMA in console mode) are likely
  // to have this path hardcoded. If there are spare cycles removing the need
  // for this would be nice, but it is cheap and shouldn't cause any other
  // issue to have re redirect in here.
  {
    path: ':category/menu/:menuId', // This is either root or the folderId
    children: [
      {
        path: 'selection',
        component: ContentListingComponent,
        canActivate: [DirectoryGuard]
      },
      {
        path: 'content/:itemId/access/:type',
        canActivate: [ContentResolver],
        resolve: { content: ContentResolver },
        children: [
          {
            path: 'play',
            component: VideoPlayerComponent
          },
          {
            path: 'login',
            component: VideoLoginComponent
          },
          {
            path: 'presentation',
            component: PresentationComponent
          },
          {
            path: 'menu',
            component: ContentLandingMenuComponent
          }
        ]
      }
    ]
  }
];

@NgModule({
  declarations: [
    ContentListingComponent,
    VideoLoginComponent,
    ContentLandingMenuComponent,
    PresentationComponent,
    PresentationCardComponent,
    ContentDescriptionComponent,
    RoundedDropdownPickerComponent,
    PresentationVideoOverlayComponent,
    VODOptionsBarComponent,
    PresentationThumbsComponent,
    LinearProgressComponent,
    VideoPlayerComponent,
    CategorySliderComponent,
    ArrowNavigationDirective
  ],
  providers: [ContentResolver, DirectoryGuard],
  imports: [
    PanningModule,
    ContentModelModule,
    CommonModule,
    BBTCommonModule,
    HttpClientModule,
    FlexLayoutModule,
    FourDirectionalNavigationModule,
    I18nModule,
    FormsModule,
    RouterExtensionModule,
    RouterModule.forChild(routes),
    MatButtonModule,
    MatIconModule,
    PlayersModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    SharedComponentsModule,
    MatProgressSpinnerModule,
    HlsModule
  ]
})
export class VODModule {}
