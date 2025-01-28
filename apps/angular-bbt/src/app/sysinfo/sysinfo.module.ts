import { Component, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main/main.component';
import { OverviewComponent } from './overview/overview.component';
import { NetworkComponent } from './network/network.component';
import { StorageComponent } from './storage/storage.component';
import { SupportComponent } from './support/support.component';
import { RouterModule } from '@angular/router';
import { BBTCommonModule } from '../bbtcommon/bbtcommon.module';
import { I18nModule } from '../i18n/i18n.module';
import { FourDirectionalNavigationModule } from '../four-directional-navigation/four-directional-navigation.module';

@NgModule({
  declarations: [
    MainComponent,
    OverviewComponent,
    NetworkComponent,
    StorageComponent,
    SupportComponent
  ],
  imports: [
    CommonModule,
    BBTCommonModule,
    I18nModule,
    FourDirectionalNavigationModule,
    RouterModule.forChild([
      {
        path: 'sysinfo',
        component: MainComponent,
        children: [
          {
            path: 'network',
            component: NetworkComponent
          },
          {
            path: 'overview',
            component: OverviewComponent
          },
          {
            path: 'storage',
            component: StorageComponent
          },
          {
            path: 'support',
            component: SupportComponent
          }
        ]
      }
    ])
  ]
})
export class SysinfoModule {}
