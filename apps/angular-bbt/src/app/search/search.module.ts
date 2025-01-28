import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search/search.component';
import { RouterModule } from '@angular/router';
import { BBTCommonModule } from '../bbtcommon/bbtcommon.module';
import { I18nModule } from '../i18n/i18n.module';
import { FormsModule } from '@angular/forms';
import { FourDirectionalNavigationModule } from '../four-directional-navigation/four-directional-navigation.module';
import { RouterExtensionModule } from '../router-extension/router-extension.module';

@NgModule({
  declarations: [SearchComponent],
  imports: [
    CommonModule,
    BBTCommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: SearchComponent
      }
    ]),
    I18nModule,
    FormsModule,
    FourDirectionalNavigationModule,
    RouterExtensionModule
  ]
})
export class SearchModule {}
