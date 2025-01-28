import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { I18nService } from '../../i18n/i18n.service';
import { ContentPresentation, VideoContent } from '../../bbtcommon/content';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FullscreenDisableAction,
  FullscreenEnableAction
} from '../../reducers/pseudoFullscreen/action';
import { select, Store } from '@ngrx/store';
import { ApplicationState } from '../../reducers';
import { NavigableContainerComponent } from '../../four-directional-navigation/navigable-container/navigable-container.component';
import { SafeKeyService } from '../../bbtcommon/safe-key.service';
import { joinedUsers } from '../../reducers/VODListing/selectors';
import {
  LoginUserAction,
  LogoutUserAction
} from '../../reducers/VODListing/action';
import { UserInputEvent } from '../../bbtcommon/UserInputEvent';

export type numChars =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '0';

@Component({
  selector: 'bbt-video-login',
  templateUrl: './video-login.component.html',
  styleUrls: ['./video-login.component.scss']
})
export class VideoLoginComponent implements OnInit, OnDestroy {
  public message: string;
  //public employees: ({ id: number })[] = [];
  public users$ = this.store.pipe(select(joinedUsers));
  public loginId: string;
  //public count: number = 0;
  @ViewChild('navContainer') containment: NavigableContainerComponent = null;
  content: ContentPresentation | VideoContent;

  ngOnInit() {
    this.content = this.route.snapshot.data.content;
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.store.dispatch(new FullscreenDisableAction());
  }

  constructor(
    private dialog: MatDialog,
    private i18n: I18nService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<ApplicationState>,
    private safeKey: SafeKeyService
  ) {
    this.store.dispatch(new FullscreenEnableAction());
  }

  private messageHandler(mess: string) {
    this.message = mess;
    setTimeout(() => (this.message = null), 5000);
  }

  login(id) {
    // tslint:disable-next-line:triple-equals
    if (id.length === 0) {
      this.messageHandler(this.i18n.i18n('LOGINNOTVALID'));
    }
    if (id.length > 0) {
      this.store.dispatch(new LoginUserAction(id));
      this.messageHandler(this.i18n.i18n('LOGINSUCCESS'));
      this.loginId = '';
    }
  }

  writeNumber(n: numChars) {
    this.loginId = Boolean(this.loginId) ? `${this.loginId}${n}` : n;
  }

  space() {
    //todo this really doesn't do what is needed
    this.loginId = this.loginId + ' ';
  }

  deleteInput() {
    if (this.loginId.length) {
      const last = this.loginId.length - 1;
      this.loginId = this.loginId.substr(0, last);
    }
  }

  clear() {
    this.loginId = '';
  }

  removeUser(e) {
    this.store.dispatch(new LogoutUserAction(e));
  }

  @HostListener('window:keydown', ['$event'])
  keydown($event: KeyboardEvent) {
    const key = this.safeKey.tryKeyLowercase($event);
    switch (key) {
      case UserInputEvent.Back:
      case 'escape':
        this.router
          .navigate(['../menu'], { relativeTo: this.route })
          .catch(console.error);
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
      case '0':
        this.writeNumber(key);
        break;
    }
  }
}
