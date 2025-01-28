import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FullscreenDisableAction,
  FullscreenToggleAction
} from '../../reducers/pseudoFullscreen/action';
import { select, Store } from '@ngrx/store';
import { ApplicationState, selectPseudoFullscreen } from '../../reducers';
import {
  PauseParkingInfo,
  ResumeParkingInfo
} from '../../reducers/parkingInfo/action';
import { ActiveService } from '../../four-directional-navigation/active.service';
import {
  activeChannel,
  activeProgram,
  channels,
  safePreviewChannel,
  safePreviewProgram
} from '../../reducers/live/live.selectors';
import { map, take, tap, switchMap } from 'rxjs/operators';
import { Observable, Unsubscribable, of } from 'rxjs';
import { SafeKeyService } from '../../bbtcommon/safe-key.service';
import { UserInputEvent } from '../../bbtcommon/UserInputEvent';
import { HlsVideoDirective } from '../../hls/hls-video/hls-video.directive';
import { LoginComponent } from '../../bbtcommon/login/login.component';
import { LoginService } from '../../bbtcommon/service/login.service';
import { I18nService } from '../../i18n/i18n.service';
import { FullscreenEnableAction } from '../../reducers/pseudoFullscreen/action';
import { MatDialog } from '@angular/material/dialog';
import {
  MatSnackBarRef,
  TextOnlySnackBar,
  MatSnackBar
} from '@angular/material/snack-bar';
import { ChannelEvent } from '../live.service';

const minute = 60 * 1000;
const hour = 60 * minute;
const threeHours = 3 * hour;

export interface ResourceEvent {
  el: HTMLElement;
  resource: any;
}

@Component({
  selector: 'bbt-live',
  templateUrl: './live.component.html',
  styleUrls: ['./live.component.scss']
})
export class LiveComponent implements OnInit, OnDestroy {
  @ViewChild(HlsVideoDirective) player: HlsVideoDirective;
  private subs = new Set<Unsubscribable>();
  playbackComplete: boolean = false;
  public preview: boolean = false;
  authenticated: boolean;
  snackRef: MatSnackBarRef<TextOnlySnackBar>;
  currentEvent: ChannelEvent;

  /**
   * Preview info
   */
  public safePreviewChannel$ = this.store.pipe(select(safePreviewChannel));
  public safePreviewProgram$ = this.store.pipe(select(safePreviewProgram));

  /**
   * The event to be played
   */
  public activeEvent$ = this.store.pipe(select(activeProgram)).pipe(
    tap(x => {
      this.playbackComplete = false;
    })
  );
  public activeEventOffset$ = this.activeEvent$.pipe(
    map(event =>
      event?.type === 'file'
        ? (Date.now() - event.startTime.valueOf()) / 1000
        : null
    ),
    tap(x => {
      if (!this.player || isNaN(x)) {
        return;
      }
      this.player.seekTo(x);
    })
  );
  public activeChannel$ = this.store.pipe(select(activeChannel));
  public channels$ = this.store.pipe(select(channels));

  public isFullscreen$ = this.store.pipe(
    select(selectPseudoFullscreen),
    map(x => (x ? x.enabled : null)),
    tap(value => {
      if (value) {
        this.active.pause();
      } else {
        this.active.resume();
      }
    }),
    map(x => Boolean(x))
  );

  public containerClass$: Observable<{
    fullscreen: boolean;
  }> = this.isFullscreen$.pipe(map(fullscreen => ({ fullscreen: fullscreen })));
  public isExpanded$ = this.isFullscreen$.pipe(map(x => !x));

  /**
   * This variable is used to determine what the spread between hours should be
   */
  public spread = threeHours;

  constructor(
    private store: Store<ApplicationState>,
    private active: ActiveService,
    private safeKey: SafeKeyService,
    public dialog: MatDialog,
    private loginService: LoginService,
    public i18nService: I18nService,
    private snack: MatSnackBar
  ) {
    this.store.dispatch(new PauseParkingInfo());
  }

  // Functions
  // Angular Lifecycle hooks
  ngOnInit(): void {
    this.subs.add(this.activeEventOffset$.subscribe());
    this.subs.add(
      this.activeEvent$.subscribe(event => {
        this.currentEvent = event;
        if (event && event.passKey) {
          this.preview = false;
          this.openDialog(event.id);
          this.store.dispatch(new FullscreenDisableAction());
        } else {
          this.preview = true;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.store.dispatch(new FullscreenDisableAction());
    this.store.dispatch(new ResumeParkingInfo());
    this.active.resume();
    this.subs.forEach(x => x.unsubscribe());
  }

  // Event key handlers
  @HostListener('window:keydown', ['$event'])
  keydown($event: KeyboardEvent) {
    const sanitized = this.safeKey.tryKeyLowercase($event);

    switch (sanitized) {
      case 'escape':
        if (this.currentEvent.passKey === true) {
          this.store.dispatch(new FullscreenDisableAction());
          this.preview = false;
        } else {
          this.store.dispatch(new FullscreenToggleAction());
        }
        break;
      case UserInputEvent.Back:
      case 'back':
        this.store.dispatch(new FullscreenDisableAction());
    }
  }

  async playVideo(player, offset = NaN) {
    // Get offset async only if required
    let safeOffset = !isNaN(offset)
      ? offset
      : await this.activeEventOffset$.pipe(take(1)).toPromise();

    player.seekTo(safeOffset);
    try {
      await player.play();
    } catch {}
  }

  protected modalUntilCodeIsRight(
    predicate: (code, id) => Observable<boolean>
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

  openDialog(id: number): void {
    this.preview = false;
    const sub = this.modalUntilCodeIsRight(code => {
      return this.loginService
        .checkEvent(code, id)
        .pipe(map(y => y && y.authenticated && y.authenticated === 'true'));
    }).subscribe({
      next: results => {
        if (results) {
          this.preview = true;
          this.store.dispatch(new FullscreenEnableAction());
        } else {
          this.preview = false;
          return false;
        }

        sub.unsubscribe();
      }
    });
  }
}
