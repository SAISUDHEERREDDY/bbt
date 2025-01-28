import { Component, Injectable, NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ManageContentComponent } from './manage-content/manage-content.component';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterModule,
  RouterStateSnapshot
} from '@angular/router';
import { BBTCommonModule } from '../bbtcommon/bbtcommon.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ConfirmContentDeleteComponent } from './confirm-content-delete/confirm-content-delete.component';
import { UpdateContentComponent } from './update-content/update-content.component';
import { I18nModule } from '../i18n/i18n.module';
import { ItemLangModule } from '../item-lang/item-lang.module';
import { UploadContentComponent } from './upload-content/upload-content.component';
import { OrderableListComponent } from './orderable-list/orderable-list.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FourDirectionalNavigationModule } from '../four-directional-navigation/four-directional-navigation.module';
import { Observable, of } from 'rxjs';
import { LoginComponent } from '../bbtcommon/login/login.component';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { LoginService } from '../bbtcommon/service/login.service';
import { SharedComponentsModule } from '@bbt/shared';
import { I18nService } from '../i18n/i18n.service';
import {
  MatSnackBar,
  MatSnackBarRef,
  TextOnlySnackBar
} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, OnInit {
  snackRef: MatSnackBarRef<TextOnlySnackBar>;

  constructor(
    public i18nService: I18nService,
    private dialog: MatDialog,
    private loginService: LoginService,
    private snack: MatSnackBar,
    private i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.i18nService.load().catch(console.error);
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const modal = this.dialog.open(LoginComponent, {
      disableClose: true
    });

    return modal.componentInstance.code.pipe(
      // Request authentication
      switchMap(code => this.loginService.checkAdmin(code)),
      // Read the response returning true if authenticated
      map(x => x && x.authenticated && x.authenticated === 'true'),

      // Close the modal if successful
      tap(x => {
        if (x) {
          modal.close();
          return modal.afterClosed().pipe(map(() => x));
        }
        this.snackRef = this.snack.open(
          this.i18n.i18n('INCORRECT_PASSCODE'),
          '',
          {
            duration: 5000,
            panelClass: ['snack-error']
          }
        );
        return of(false);
      }),
      // Filter out any falsy request
      filter(x => x)
    );
  }
}

@Component({
  template: '<router-outlet></router-outlet>'
})
export class LocalRootComponent {}

@NgModule({
  declarations: [
    ManageContentComponent,
    ConfirmContentDeleteComponent,
    OrderableListComponent,
    UpdateContentComponent,
    UploadContentComponent,
    LocalRootComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    BBTCommonModule,
    FlexLayoutModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    BrowserAnimationsModule,
    SharedComponentsModule,
    ItemLangModule,
    RouterModule.forChild([
      {
        path: 'local',
        component: LocalRootComponent,
        canActivate: [AuthGuard],
        children: [
          {
            path: 'manage',
            component: ManageContentComponent
          },
          {
            path: 'upload',
            component: UploadContentComponent
          }
        ]
      }
    ]),
    I18nModule,
    FourDirectionalNavigationModule
  ],
  entryComponents: [ConfirmContentDeleteComponent]
})
export class LocalContentModule {}
