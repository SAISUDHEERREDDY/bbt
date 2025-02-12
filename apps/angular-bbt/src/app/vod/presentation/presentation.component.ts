import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../../reducers';
import { SafeKeyService } from '../../bbtcommon/safe-key.service';
import { ActiveService } from '../../four-directional-navigation/active.service';
import {
  currentFile,
  currentPresentationIndex,
  contentFiles
} from '../../reducers/VODListing/selectors';
import {
  setPresentationIndex,
  shiftPresentationIndex
} from '../../reducers/VODListing/action';
import { AutoplayPermittedService } from '../../bbtcommon/autoplay-permitted.service';
import { ContentOverlayModalService } from '../content-overlay-modal.service';
import { VODPlayback } from '../VODPlayback';
import {
  ResumeParkingInfo,
  PauseParkingInfo
} from '../../reducers/parkingInfo/action';
import {
  SanitizedUserInput,
  UserInputEvent
} from '../../bbtcommon/UserInputEvent';
import { tap } from 'rxjs/operators';
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'bbt-presentation',
  templateUrl: './presentation.component.html',
  styleUrls: ['../playback.less', './presentation.component.less']
})
export class PresentationComponent extends VODPlayback implements OnDestroy {
  safeHtmlContent!: SafeHtml;
  constructor(
    route: ActivatedRoute,
    store: Store<ApplicationState>,
    router: Router,
    safeKey: SafeKeyService,
    active: ActiveService,
    autoplayPermitted: AutoplayPermittedService,
    contentOverlayService: ContentOverlayModalService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {
    super(
      store,
      active,
      route,
      router,
      safeKey,
      contentOverlayService,
      autoplayPermitted
    );

    this.store.dispatch(new PauseParkingInfo());
  }

  // Handling for vidPlayer
  private _player: ElementRef<HTMLVideoElement>;
  @ViewChild('player') set player(e: ElementRef<HTMLVideoElement>) {
    this._player = e;

    this.bindProgress();
  }
  get player() {
    return this._player;
  }

  // Presentation navigation helpers
  /**
   * Shifts the presentation to the previous file
   * @param $event
   */
  playPrevious($event = null) {
    PresentationComponent.swallowEvent($event);
    this.store.dispatch(shiftPresentationIndex({ shift: -1 }));
  }

  /**
   * Shifts the presentation to the next file
   * @param $event
   */
  playNext($event = null) {
    PresentationComponent.swallowEvent($event);
    this.store.dispatch(shiftPresentationIndex({ shift: 1 }));
  }

  /**
   * Shift the presentation to the last item
   */
  playLast() {
    this.store.dispatch(shiftPresentationIndex({ shift: 'last' }));
  }

  // Overlay concern extensions
  /**
   * Opens the controls overlay and does additional presentation related binding
   */
  openOverlay = (haltPlayback = true) => {
    const overlay = this.createOverlay(haltPlayback);

    // Do nothing if already open
    if (!overlay) {
      return;
    }

    // Hooks inputs to state
    overlay.nextToInput('files', this.store.select(contentFiles));
    overlay.nextToInput('selected', this.store.select(currentFile));
    overlay.nextToInput(
      'selectedIndex',
      this.store.select(currentPresentationIndex)
    );

    // Add slide shifting state modifiers
    overlay.onOutput('previousSlide', () =>
      this.store.dispatch(shiftPresentationIndex({ shift: -1 }))
    );
    overlay.onOutput('nextSlide', () =>
      this.store.dispatch(shiftPresentationIndex({ shift: 1 }))
    );
    overlay.onOutput('jumpToSlide', index =>
      this.store.dispatch(setPresentationIndex({ index }))
    );
  };

  // Listeners
  @HostListener('window:keydown', ['$event'])
  async keydown($event: KeyboardEvent) {
    const key = this.safeKey.tryKeyLowercase($event);
    const handled = await this.handleKeydown($event, key);

    // If this was handleable by a common event be done
    if (handled) {
      return;
    }

    // Handle extended presentation key presses
    if (this.overlayIsOpen()) {
      // Only do common key presses
      return this.handleCommonKeyPresses(key, $event);
    } else {
      return this.handlePresentationKeyPress(key, $event);
    }
  }

  // Mode based key press handlers
  /**
   * Handles key presses when in presentation mode (no overlay)
   * @param key
   * @param $event
   */
  handlePresentationKeyPress(
    key: string | UserInputEvent,
    $event: KeyboardEvent
  ) {
    // Is it important that the keydown event be used with the key property.
    // Do not change these things!
    switch (key) {
      case 'enter' :
        PresentationComponent.swallowEvent($event);

        if ($event.repeat) {
          return;
        }

        this.openOverlay();
        return;
        case 'e' :
          PresentationComponent.swallowEvent($event);
  
          if ($event.repeat) {
            return;
          }
  
          this.openOverlay();
          return;
      case UserInputEvent.PlayPause:
        return this.togglePlay();
      case UserInputEvent.Back:
      case 'escape':
        return this.returnToMenu();
      case 'arrowleft':
        this.playPrevious();
        return;
      case 'arrowright':
        this.playNext();
        return;
      default:
        this.handleCommonKeyPresses(key, $event);
        break;
    }
  }

  /**
   * Handle key presses that are the same regardless of mode.
   * @param key
   * @param $event
   */
  handleCommonKeyPresses(key: SanitizedUserInput, $event: KeyboardEvent) {
    switch (this.safeKey.tryKeyLowercase($event)) {
      // Uncomment this to test debugging of overlay elements when
      // video is playing
      // case 'z':
      //   // Toggle Pause
      //   this.hlsVideoDirective.togglePlay().then();
      //   return;
      // case 'y':
      //   this.playPrevious();
      //   return;
      // case 'k':
      //   this.playNext();
      //   return;
      default:
        return;
    }
  }
  ngOnInit(): void {
    this.store.select(currentFile).subscribe((file) => {
      if (file?.type === 'Html' && file.filePath) {
        this.loadHtmlContent(file.filePath);
      }
    });
  }
  loadHtmlContent(url: string): void {
    this.http.get(url, { responseType: 'text' }).subscribe(
      (response) => {
        this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(response);
      },
      (error) => {
        console.error('Error loading HTML file:', error);
      }
    );
  }

  // Angular Lifecycle Hooks
  ngOnDestroy() {
    this.dispose();
    this.store.dispatch(new ResumeParkingInfo());
  }
}
