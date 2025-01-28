import { event } from 'jquery';
import {
  Component,
  HostListener,
  InjectionToken,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { I18nService } from './i18n/i18n.service';
import { select, Store } from '@ngrx/store';
import { ApplicationState, selectPseudoFullscreenEnabled } from './reducers';
import { Unsubscribable } from 'rxjs';
import { INavigable } from './four-directional-navigation/navigable';
import { ActiveService } from './four-directional-navigation/active.service';
import { IdlenessService } from './idle/idleness.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { CrossMessageService } from './bbtcommon/cross-message.service';
import { FeatureSwitchesService } from './bbtcommon/feature-switches.service';
import { SwitchableFeature } from './bbtcommon/SwitchableFeatures';
import { SafeKeyService } from './bbtcommon/safe-key.service';
import { UserInputEvent } from './bbtcommon/UserInputEvent';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from './bbtcommon/login/login.component';
import { LoginService } from './bbtcommon/service/login.service';
import { Observable, of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import {
  MatSnackBar,
  MatSnackBarRef,
  TextOnlySnackBar
} from '@angular/material/snack-bar';
import { SupportedLanguage } from './i18n/lang.types';
import { FocusService } from './bbtcommon/service/focus.service';
// export interface QtToken {
//   qt: boolean;
// }
// export const QT = new InjectionToken<QtToken>('window#document', {
//   providedIn: 'root',
//   factory: () => ({ qt: Boolean((window as any).qt) })
//   // factory: () => ({qt: true}) as any // fake branch server
// });

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
  selector: 'bbt-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  // Angular datamembers
  @ViewChild('sideMenuStart') sideMenuStart: INavigable;

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
  currentUrl: string = '';
  homePageUrl: string = '/vod/root/menu/none/selection';
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
    public i18nService: I18nService,
    public dialog: MatDialog,
    public crossMessageService: CrossMessageService,
    public active: ActiveService,
    private focusService: FocusService
  ) {
    // Default feature from platforms
    this.features.detectPlatformFeatures();
    this.startFeatureSubscriptions(); // Sets up ongoing feature subscriptions
    this.determineIdlenessStrategy();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
      }
    });
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
  goBack() {
    if (this.currentUrl != this.homePageUrl) {
      window.history.back();
      console.log(window.history, 'appComponent');
    }
  }
  cancel() {
    this.toggleSideNav(false);
    this.active.activatePrevious();
  }

  lifeCycleComplete() {
    this.crossMessageService.complete();
    this.cancel();
  }

  // Listener events
  @HostListener('window:keydown', ['$event'])
  globalKeyDown(event: KeyboardEvent) {
    const key = this.safeKey.tryKey(event);
    console.log(key, 'keyHandler');
    // const totalFocusableElements = this.focusService.getTotalFocusableElements();debu
    switch (key) {
      case 'ArrowRight':
        // const nextIndex =
        //     (this.focusService.getFocusIndex() + 1) % totalFocusableElements;
        //   this.focusService.setFocus(nextIndex);
        this.focusService.moveFocus(1); // Move focus to the next element globally
        event.preventDefault();
        break;
      case 'ArrowLeft':
        //   const prevIndex =
        //   this.focusService.getFocusIndex() === 0 ? - 1 : this.focusService.getFocusIndex() - 1;
        //   console.log("prevIndex", prevIndex);
        //   if (prevIndex === -1) {
        //     this.focusService.focusBackButton();
        // } else {
        //     this.focusService.setFocus(prevIndex);
        // }
        this.focusService.moveFocus(-1); // Move focus to the previous element globally
        event.preventDefault();
        break;
      case 'Backspace' || 'Escape':
        event.preventDefault();
        this.goBack();
        break;
      case 'd':
        event.preventDefault();
        this.goBack();
        break;
      case UserInputEvent.Home:
        if (this.features.get('HomeMessage')) {
          this.crossMessageService.passHomeMessage();
        }
        break;
      case UserInputEvent.Menu:
        if (this.features.get('MenuMessage')) {
          this.crossMessageService.passMenuMessage();
        }
        break;
      case UserInputEvent.VolumeUp:
        if (this.features.get('VolumeMessage')) {
          this.crossMessageService.passVolumeMessage(1);
        }
        break;
      case UserInputEvent.VolumeDown:
        if (this.features.get('VolumeMessage')) {
          this.crossMessageService.passVolumeMessage(-1);
        }
        break;
    }
  }

  // Angular lifecycle hooks
  ngOnInit(): void {
    this.i18nService.load().catch(console.error);
  }

  ngOnDestroy(): void {
    this.subs.forEach(x => x.unsubscribe());
  }
}
