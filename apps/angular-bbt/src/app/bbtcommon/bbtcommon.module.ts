import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeadingNavigationComponent } from './heading-navigation/heading-navigation.component';

import { RouterModule } from '@angular/router';
import { ContentInfoComponent } from './content-info/content-info.component';
import { ContentCardComponent } from './content-card/content-card.component';
import { ImagePreloadDirective } from './directives/image-preload.directive';
import { EncodeURIComponentPipe } from './encode-uricomponent.pipe';
import { PrimaryNavigationComponent } from './primary-navigation/primary-navigation.component';
import { PlyrComponent } from './plyr/plyr.component';
import { FourDirectionalNavigationModule } from '../four-directional-navigation/four-directional-navigation.module';
import { JumbotronComponent } from './jumbotron/jumbotron.component';
import { TopTitleNavComponent } from './top-title-nav/top-title-nav.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { ConfirmComponent } from './confirm/confirm.component';
import { ModalComponent } from './modal/modal.component';
import { FocusDirective } from './directives/focus.directive';
import { KeypadComponent } from './keypad/keypad.component';
import { LoginComponent } from './login/login.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { I18nModule } from '../i18n/i18n.module';
import { EncodeURIPipe } from './encode-uri.pipe';
import { KeyboardComponent } from './keyboard/keyboard.component';
import { BucketPipe } from './bucket.pipe';
import { RemoveXPathLayerPipe } from './remove-xpath-layer.pipe';
import { HeadingClockComponent } from './heading-clock/heading-clock.component';
import { LinearTimePipe } from './linear-time.pipe';
import { CaptionLanguageDirective } from './caption-language.directive';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { SafeKeyService } from './safe-key.service';
import { WindowRef } from './WindowRef';
import { SessionStorageService } from './session-storage.service';
import { FeatureIsOnDirective } from './feature-is-on.directive';
import { SharedComponentsModule } from '@bbt/shared';
import { SysinfoMenuComponent } from './sysinfo-menu/sysinfo-menu.component';
import { FooterNavigationComponent } from './footer-navigation/footer-navigation.component';
import { LogoContainerComponent } from './logo-container/logo-container.component';

import { ObfuscatePipe } from './obfuscate.pipe';
import { ItemLangModule } from '../item-lang/item-lang.module';
import { HasTracksPipe } from './has-tracks.pipe';

@NgModule({
  declarations: [
    PrimaryNavigationComponent,
    HeadingNavigationComponent,
    FooterNavigationComponent,
    LogoContainerComponent,
    ContentInfoComponent,
    ContentCardComponent,
    ImagePreloadDirective,
    EncodeURIComponentPipe,
    PlyrComponent,
    JumbotronComponent,
    TopTitleNavComponent,
    ConfirmComponent,
    ModalComponent,
    FocusDirective,
    KeypadComponent,
    LoginComponent,
    EncodeURIPipe,
    BucketPipe,
    EncodeURIPipe,
    KeyboardComponent,
    RemoveXPathLayerPipe,
    HeadingClockComponent,
    LinearTimePipe,
    CaptionLanguageDirective,
    FeatureIsOnDirective,
    FeatureIsOnDirective,
    SysinfoMenuComponent,
    ObfuscatePipe,
    HasTracksPipe
  ],
  exports: [
    HeadingNavigationComponent,
    FooterNavigationComponent,
    PrimaryNavigationComponent,
    LogoContainerComponent,
    ContentInfoComponent,
    ContentCardComponent,
    ImagePreloadDirective,
    PlyrComponent,
    JumbotronComponent,
    TopTitleNavComponent,
    ConfirmComponent,
    ModalComponent,
    FocusDirective,
    LoginComponent,
    EncodeURIPipe,
    KeyboardComponent,
    KeypadComponent,
    RemoveXPathLayerPipe,
    LinearTimePipe,
    CaptionLanguageDirective,
    FeatureIsOnDirective,
    SysinfoMenuComponent,
    PrimaryNavigationComponent,
    FooterNavigationComponent
  ],
  entryComponents: [LoginComponent],
  imports: [
    CommonModule,
    RouterModule,
    FourDirectionalNavigationModule,
    RouterModule,
    OverlayModule,
    MatDialogModule,
    FormsModule,
    I18nModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatGridListModule,
    MatSnackBarModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
    SharedComponentsModule,
    ItemLangModule
  ],
  providers: [SafeKeyService, WindowRef, SessionStorageService]
})
export class BBTCommonModule {}
