import {
  Attribute,
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { LoginComponent } from '../bbtcommon/login/login.component';
import { map, switchMap, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { OnDemandContentService } from '../content-model/on-demand-content.service';
import { SafeKeyService } from '../bbtcommon/safe-key.service';
import {
  MatSnackBar,
  MatSnackBarRef,
  TextOnlySnackBar
} from '@angular/material/snack-bar';
import { I18nService } from '../i18n/i18n.service';

@Directive({
  selector: '[bbtPasskeyProtectedLink]'
})
export class PasskeyProtectedLinkDirective {
  private routerLink: RouterLink;

  get protectedRouterLink(): any[] | string {
    return this.routerLink.routerLink;
  }
  @Input('bbtPasskeyProtectedLink') set protectedRouterLink(
    route: any[] | string
  ) {
    this.routerLink.routerLink = route;
  }
  @Input() content: {
    id?: number;
    itemId?: number;
    passKey?: boolean;
    //pifId?: number;
    type?: string;
  } = { passKey: false, id: null, itemId: null, };

  @Input() categoryId: number;
  @Input() folderId: number;

  snackRef: MatSnackBarRef<TextOnlySnackBar>;

  constructor(
    router: Router,
    route: ActivatedRoute,
    @Attribute('tabindex') tabIndex: string,
    renderer: Renderer2,
    el: ElementRef,
    private dialog: MatDialog,
    private api: OnDemandContentService,
    private safeKeyService: SafeKeyService,
    private snack: MatSnackBar,
    private i18n: I18nService
  ) {
    this.routerLink = new RouterLink(router, route, tabIndex, renderer, el);
  }

  private isProtected() {
    return (
      this.content &&
      this.content.passKey &&
      (this.content.passKey === true || this.content.passKey === 'true')
    );
  }

  private handleActivation(): boolean {
    if (!this.isProtected()) {
      return this.routerLink.onClick();
    }

    const sub = this.modalUntilCodeIsRight(code => {
      return this.api
        .passkeyContent(
          code,
          this.content.itemId || this.content.id,
          this.api.isContentLocal(this.content),
          this.categoryId,
          this.folderId
        )
        .pipe(map(y => y && y.authenticated && y.authenticated === 'true'));
    }).subscribe({
      next: results => {
        if (!results) {
          return false;
        }

        sub.unsubscribe();
        return this.routerLink.onClick();
      }
    });

    return false;
  }

  @HostListener('click')
  onClick(): boolean {
    return this.handleActivation();
  }

  @HostListener('keydown', ['$event'])
  onEnter(event) {
    if (this.safeKeyService.tryKeyLowercase(event) === 'enter') {
      this.handleActivation();
    }
  }

  protected modalUntilCodeIsRight(
    predicate: (code) => Observable<boolean>
  ): Observable<boolean> {
    const modal = this.dialog.open(LoginComponent, {
      disableClose: true
    });

    return modal.componentInstance.code.pipe(
      switchMap(predicate), // Request authentication
      switchMap(x => {
        // Close the modal if successful
        if (x) {
          modal.close();
          // Wait until the modal is gone to return x
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
      })
    );
  }
}
