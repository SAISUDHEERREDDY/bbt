import { Component, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetTopComponent } from './net-top/net-top.component';
import { NetIpComponent } from './net-ip/net-ip.component';
import { RouterModule } from '@angular/router';
import { BBTCommonModule } from '../bbtcommon/bbtcommon.module';
import { I18nModule } from '../i18n/i18n.module';
import { FourDirectionalNavigationModule } from '../four-directional-navigation/four-directional-navigation.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [NetTopComponent, NetIpComponent],
  imports: [
    CommonModule,
    BBTCommonModule,
    I18nModule,
    FourDirectionalNavigationModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: 'config',
        component: NetTopComponent
      },
      {
        path: 'config/net-ip',
        component: NetIpComponent
      }
    ])
  ]
})
export class ConfigModule {}
