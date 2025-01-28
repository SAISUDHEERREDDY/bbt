import {
  Component,
  HostListener,
  InjectionToken,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  BreakpointObserver,
  BreakpointState,
  Breakpoints
} from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import {
  MatSnackBarRef,
  TextOnlySnackBar,
  MatSnackBar
} from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { Observable, of, Unsubscribable } from 'rxjs';
import { ActiveService } from '../../four-directional-navigation/active.service';
import { INavigable } from '../../four-directional-navigation/navigable';
import { I18nService } from '../../i18n/i18n.service';
import { IdlenessService } from '../../idle/idleness.service';
import {
  ApplicationState,
  selectPseudoFullscreen,
  selectPseudoFullscreenEnabled
} from '../../reducers';

import { SwitchableFeature } from '../../bbtcommon/SwitchableFeatures';
import { FeatureSwitchesService } from '../../bbtcommon/feature-switches.service';
import { CrossMessageService } from '../../bbtcommon/cross-message.service';
import { LoginComponent } from '../login/login.component';
import { SafeKeyService } from '../safe-key.service';
import { LoginService } from '../service/login.service';
import { SupportedLanguage } from '../../i18n/lang.types';
import { UserInputEvent } from '../../bbtcommon/UserInputEvent';

export interface QtToken {
  qt: boolean;
}
export const QT = new InjectionToken<QtToken>('window#document', {
  providedIn: 'root',
  factory: () => ({ qt: Boolean((window as any).qt) })
  // factory: () => ({qt: true}) as any // fake branch server
});

export interface DialogData {
  authenticated: boolean;
}

@Component({
  selector: 'bbt-primary-navigation',
  templateUrl: './primary-navigation.component.html',
  styleUrls: ['./primary-navigation.component.scss']
})
export class PrimaryNavigationComponent implements OnInit, OnDestroy {
  // Angular datamembers
  @ViewChild('sideMenuStart') sideMenuStart: INavigable;
  // @ViewChild('sidenav') sideNav;

  // Traditional Data Members
  authenticated: boolean;
  snackRef: MatSnackBarRef<TextOnlySnackBar>;

  /**
   * Tracker for if we are in pseudo fullscreen mode
   */
  fullscreen: boolean;

  // Sidenav state flags
  inLanguage = false;
  inSettings = false;
  inSettingsAuth = false;
  sideNavOpen = false;

  // Mobile setting
  hideOnDesktop: boolean;
  isMobile: boolean;
  bottomNavOpen = false;

  public isFullscreen$ = this.store.pipe(
    select(selectPseudoFullscreen),
    map(x => Boolean(x ? x.enabled : null)),
    distinctUntilChanged()
  );

  /**
   * General subscriptions that should be cleaned up on component destruction
   */
  private subs = new Set<Unsubscribable>().add(
    this.store.pipe(select(selectPseudoFullscreenEnabled)).subscribe(x => {
      this.fullscreen = x;
    })
  );

  constructor(
    private store: Store<ApplicationState>,
    private idleness: IdlenessService,
    private router: Router,
    private route: ActivatedRoute,
    private features: FeatureSwitchesService,
    private loginService: LoginService,
    private snack: MatSnackBar,
    private safeKey: SafeKeyService,
    public breakpointObserver: BreakpointObserver,
    public i18nService: I18nService,
    public dialog: MatDialog,
    public crossMessageService: CrossMessageService,
    public active: ActiveService
  ) {
    // Default feature from platforms
    this.features.detectPlatformFeatures();
    this.startFeatureSubscriptions(); // Sets up ongoing feature subscriptions
    this.determineIdlenessStrategy();
  }

  /**
   * Determines the idleness strategies in pay and reacts approriately.
   */
  private determineIdlenessStrategy() {
    this.subs.add(
      this.features
        .listenForFeatureChanges('ParkingChannel')
        .pipe(
          filter(isOn => isOn),
          switchMap(() => this.idleness.parkingIdle)
        )
        .subscribe(() =>
          this.router.navigate(['player', 'idle'], {
            skipLocationChange: true
          })
        )
    );

    // Pass interaction indicator to any parent application
    this.subs.add(
      this.idleness.interaction
        .pipe(map(e => (e as any)?.type))
        .subscribe(type => {
          this.crossMessageService.passActivityMessage(type);
        })
    );
  }

  /**
   * Sets up feature based subscriptions
   */
  private startFeatureSubscriptions() {
    this.subs.add(
      this.route.queryParamMap
        .pipe(
          // Parse queryParams into usable map
          map(queryParams => {
            const featureMap = new Map<string, boolean>();
            const params = queryParams.keys.filter(x =>
              x.startsWith('feature')
            );

            for (const paramKey of params) {
              const matches = paramKey.match(this.features.featureKeyPattern);

              // Set feature
              if (matches && matches.length > 1) {
                const featureKey = matches[1];
                const value = Boolean(
                  queryParams.get(paramKey)?.toLowerCase() === 'true'
                );
                featureMap.set(featureKey as SwitchableFeature, value);
              }
            }

            return featureMap;
          })
        )
        .subscribe(featureMap => {
          // Set keys
          for (const [featureKey, value] of featureMap) {
            this.features.set(featureKey as SwitchableFeature, value);
          }

          // Set consquental values
          this.active.enabled = this.features.get('Navigables');
        })
    );
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
          this.inSettings = true;
          // Wait until the modal is gone to return x
          return modal.afterClosed().pipe(map(() => x));
        }

        this.inSettings = false;
        this.snackRef = this.snack.open(
          this.i18nService.i18n('INCORRECT_PASSCODE'),
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

  openDialog(): void {
    const sub = this.modalUntilCodeIsRight(code => {
      return this.loginService
        .checkAdmin(code)
        .pipe(map(y => y && y.authenticated && y.authenticated === 'true'));
    }).subscribe({
      next: results => {
        if (!results) {
          return false;
        }

        sub.unsubscribe();
      }
    });
  }

  // Sidenav logic (should probably be moved into its own component)
  changeLang(key: SupportedLanguage) {
    this.inLanguage = false;
    this.i18nService.set_locale(key);
    this.toggleSideNav(false);
    this.active.activatePrevious();
  }

  toggleSideNav(newState: boolean = !this.sideNavOpen) {
    if (!newState) {
      this.sideNavOpen = newState;
      this.inLanguage = false;
      this.inSettings = false;
      this.inSettingsAuth = false;
      return;
    }

    this.inLanguage = false;
    this.inSettings = false;
    this.inSettings = false;
    this.sideNavOpen = newState;
  }

  focusMainSideNav(nav: INavigable) {
    this.active.pushAndSteal(nav);
  }

  cancel() {
    this.toggleSideNav(false);
    this.active.activatePrevious();
  }

  lifeCycleComplete() {
    this.crossMessageService.complete();
    this.cancel();
  }

  // Angular lifecycle hooks
  ngOnInit(): void {
    this.i18nService.load().catch(console.error);
    this.breakpointObserver
      .observe([
        Breakpoints.Small,
        Breakpoints.HandsetPortrait,
        Breakpoints.XSmall
      ])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.isMobile = true;
        } else {
          this.isMobile = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.subs.forEach(x => x.unsubscribe());
  }
}
