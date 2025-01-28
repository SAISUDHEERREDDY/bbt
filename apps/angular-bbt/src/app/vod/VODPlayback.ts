import { ApplicationState } from '../reducers';
import { select, Store } from '@ngrx/store';
import {
  FullscreenDisableAction,
  FullscreenEnableAction
} from '../reducers/pseudoFullscreen/action';
import { ActiveService } from '../four-directional-navigation/active.service';
import { ElementRef } from '@angular/core';
import { OverlayManager } from './overlay-manager';
import { PresentationVideoOverlayComponent } from './presentation-video-overlay/presentation-video-overlay.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeKeyService } from '../bbtcommon/safe-key.service';
import { ContentOverlayModalService } from './content-overlay-modal.service';
import { fromPromise } from 'rxjs/internal-compatibility';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  switchMap
} from 'rxjs/operators';
import { merge, Unsubscribable } from 'rxjs';
import { AutoplayPermittedService } from '../bbtcommon/autoplay-permitted.service';
import {
  currentFile,
  currentPresentationIndex,
  defaultFileAudioTrackId,
  defaultFileCaption,
  defaultFileAudioTrack
} from '../reducers/VODListing/selectors';
import {
  setCaptionLanguage,
  setPresentationIndex,
  updateAudioTrack,
  updateAudioTracks
} from '../reducers/VODListing/action';
import { HlsAudioTrack } from './HlsAudioTrack';
import { FormControl } from '@angular/forms';
import {
  SanitizedUserInput,
  UserInputEvent
} from '../bbtcommon/UserInputEvent';

export abstract class VODPlayback {
  protected playSubscription: Unsubscribable;
  /**
   * A set of subscriptions to destroy during cleanup.
   * @private
   */
  private subs = new Set<Unsubscribable>();

  private back = ['..', 'menu'];

  captionControl = new FormControl();
  audioControl = new FormControl();

  /**
   * Emits language codes
   */
  caption$ = merge(
    this.captionControl.valueChanges,
    this.store.pipe(select(defaultFileCaption))
  );

  captionLanguage$ = this.caption$.pipe(
    map(x => x?.srclang),
    distinctUntilChanged()
  );

  protected constructor(
    protected store: Store<ApplicationState>,
    protected active: ActiveService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected safeKey: SafeKeyService,
    protected contentOverlayService: ContentOverlayModalService,
    protected autoplayPermitted: AutoplayPermittedService
  ) {
    this.store.dispatch(new FullscreenEnableAction());

    // Since there is nothing navigable by default pause active.
    this.active.pause();

    // Watch state changes and update caption control when default changes
    
    /*  09/17/2024 - TESTING ..... MAYBE ADD THIS BACK!
    this.subs.add(
      this.store.pipe(select(defaultFileCaption)).subscribe(caption => {
        this.captionControl.setValue(caption);
      })
    );
    */

    this.subs.add(
      this.store.pipe(select(defaultFileAudioTrack)).subscribe(audio => {
        // Guard against re-updates
        if (audio?.lang === this.audioControl.value?.lang) {
          return;
        }

        this.audioControl.setValue(audio);
      })
    );
  }

  // Abstract members that have to be hooked in with annotations
  abstract player: ElementRef<HTMLVideoElement>;

  /**
   * Member to defined to extend opening the overlay
   */
  abstract openOverlay: (pause: boolean) => void;

  private controlsOverlay: OverlayManager<PresentationVideoOverlayComponent> =
    null;
  protected videoListeners = new Set<() => void>();

  // ngRx Hooks
  file$ = this.store.pipe(select(currentFile));
  audioTrackId$ = merge(
    this.store.pipe(select(defaultFileAudioTrackId)),
    this.audioControl.valueChanges.pipe(map(x => x?.id))
  ).pipe(
    filter(x => typeof x === 'number'),
    distinctUntilChanged()
  );

  /**
   * Helper to prevent an event from continuing
   * @param $event
   * @private
   */
  protected static swallowEvent($event) {
    $event?.preventDefault();
    $event?.stopPropagation();
  }

  /**
   * Helper to navigate back to the menu
   */
  async returnToMenu() {
    return await this.router.navigate(this.back, { relativeTo: this.route });
  }

  // State manipulators
  /**
   * Updates state based on a change in parsed HLS media
   * @param tracks
   */
  manifestParsed(tracks: HlsAudioTrack[]) {
    this.store.dispatch(
      updateAudioTracks({
        // Copy tracks without references
        tracks: tracks.map(x => ({
          id: x.id,
          lang: x.lang,
          name: x.name,
          url: x.url,
          default: x.default,
          type: x.type,
          autoselect: x.autoselect,
          groupId: x.groupId,
          forced: x.forced
        }))
      })
    );
  }

  // Overlay Concerns

  /**
   * Returns true if the overlay is open
   */
  public overlayIsOpen() {
    return this.controlsOverlay;
  }

  /**
   * Clean up any progress related resources
   */
  private disposeOfProgress() {
    // clear existing bindings
    for (const listener of this.videoListeners) {
      listener();
    }
    this.videoListeners?.clear();
  }

  /**
   * Bind video progress to output.
   */
  protected bindProgress() {
    this.disposeOfProgress();

    // Do nothing if there is no video player
    if (!this.player?.nativeElement) {
      return;
    }

    // Be done if there is no overlay
    if (!this.controlsOverlay) {
      return;
    }

    if (this.controlsOverlay?.instance?.progress) {
      this.controlsOverlay.instance.progress.nativeEl =
        this.player.nativeElement;
    }

    this.controlsOverlay.instance.mediaElement = this.player.nativeElement;
  }

  /**
   * Opens the controls overlay
   * @return  Created overlay or null if creation skipped
   */
  protected createOverlay(haltPlayback = true) {
    // Don't reopen if already open;
    if (this.controlsOverlay !== null) {
      return null;
    }

    if (haltPlayback) {
      this.playSubscription?.unsubscribe();
      this.player?.nativeElement?.pause();
    }

    // Turn 4d nav back on
    this.active.resume();

    // Create and bind overlay
    const overlay = this.contentOverlayService.create();
    const instance = overlay.instance;

    // Bind formControls
    instance.captionControl = this.captionControl;
    instance.audioControl = this.audioControl;

    overlay.onOutput('back', () => this.returnToMenu());

    // Hook overlay events
    this.contentOverlayService.hookVideoMediaShiftEvents(
      overlay,
      this.shift.bind(this)
    );

    overlay.onOutput('play', () => {
      this.player?.nativeElement
        ?.play()
        .catch(e =>
          console.error('failed to play on overlay close with error', e)
        );
      this.closeOverlay();
    });

    // Hooks inputs to state
    overlay.nextToInput('selected', this.store.select(currentFile));
    overlay.nextToInput(
      'selectedIndex',
      this.store.select(currentPresentationIndex)
    );

    // Hooks outputs to state
    overlay.onOutput('captionTrackChanged', cap =>
      this.store.dispatch(setCaptionLanguage({ code: cap?.srclang }))
    );
    overlay.onOutput('jumpToSlide', index =>
      this.store.dispatch(setPresentationIndex({ index }))
    );

    overlay.onOutput('audioTrackChanged', audio => {
      // Guard against re-emission
      if (this.audioControl.value === audio) {
        return;
      }
      this.store.dispatch(updateAudioTrack({ id: audio?.id }));
    });

    // Initialize video value if applicable
    if (this.player?.nativeElement) {
      overlay.instance.mediaElement = this.player?.nativeElement;
    }

    this.controlsOverlay = overlay;
    return overlay;
  }

  /**
   * Closes the controls overlay and cleans up the components.
   */
  protected closeOverlay() {
    // Clean up overlay
    this.controlsOverlay?.destroy();

    // Null out reference
    this.controlsOverlay = null;

    this.active.pause();
  }

  /**
   * Shifts to the next text track
   */
  protected shiftTextTrack(tracks: TextTrackList, shift: 1 | -1) {
    // Find active track
    if (!tracks.length) {
      return; // Do nothing if there are no tracks
    }

    let newIndex: number = null;
    for (let i = 0; i < tracks.length; ++i) {
      const track = tracks[i];

      if (track.mode === 'showing') {
        track.mode = 'disabled';
        newIndex = i + shift;
      }
    }

    // If nothing was active
    if (newIndex === null) {
      tracks[0].mode = 'showing';
    } else if (0 > newIndex || newIndex > tracks.length) {
      // If you have exhausted all the tracks just leave them disabled
      return;
    } else if (tracks[newIndex]) {
      // Otherwise just activate the next track
      tracks[newIndex].mode = 'showing';
    }
  }

  /**
   * Function to safely attempt to play content and fail back to playing on safe
   * events
   */
  public safePlay() {
    // If controls are currently active do not play
    if (this.controlsOverlay) {
      return;
    }

    // If current waiting to play clean that up
    if (this.playSubscription) {
      this.playSubscription.unsubscribe();
    }

    const promise = this.player.nativeElement.play();
    this.playSubscription = fromPromise(promise)
      .pipe(
        // If it can't playback because there hasn't been input yet try again
        // when there has been input
        catchError(() =>
          this.autoplayPermitted.isPermitted$.pipe(
            filter(x => x),
            switchMap(() => fromPromise(this.player.nativeElement.play()))
          )
        )
      )
      .subscribe({
        complete: () => {
          this.playSubscription.unsubscribe();
          this.playSubscription = null;
        }
      });
  }

  /**
   * Safely shifts the time in the video
   * @param seconds seconds to shift in seconds
   */
  protected shift(seconds: number) {
    const vid = this.player?.nativeElement;

    if (!vid) {
      return;
    }

    vid.currentTime += seconds;
  }

  /**
   * Toggles playback
   * @returns A promise for the playback
   */
  protected async togglePlay() {
    if (this.player?.nativeElement?.paused) {
      return this.safePlay();
    } else {
      this.player?.nativeElement?.pause();
      return Promise.resolve();
    }
  }

  protected skipForward() {
    this.shift(this.contentOverlayService.smallShift);
  }

  protected skipBackward() {
    this.shift(-this.contentOverlayService.smallShift);
  }

  // Key handlers
  /**
   * Handle key presses that relate exclusively to media playback that are
   * largely dictated by the remote bindings.
   * @param key
   * @param $event
   * @returns A Promise that is true when event was handled otherwise it is
   *          false
   */
  protected async commonKeys(
    key: SanitizedUserInput,
    $event: KeyboardEvent
  ): Promise<boolean> {
    const vid = this.player?.nativeElement;
    if (!vid) {
      return false;
    }

    switch (key) {
      case UserInputEvent.Stop:
        // Stop the video
        vid.currentTime = 0;
        vid.pause();
        return true;

      case UserInputEvent.FastForward:
        // case 'f': // Removed for the simple remote
        // Shift forward
        this.skipForward();
        return true;

      case UserInputEvent.Rewind:
        // Shift backward
        this.skipBackward();
        return true;

      case UserInputEvent.Caption:
        // case 'c': // Removed for the simple remote
        VODPlayback.swallowEvent($event);
        this.shiftTextTrack(this.player?.nativeElement?.textTracks, 1);
        return true;

      default:
        return false;
    }
  }

  /**
   * Keys that are use only when playback is happening
   */
  protected async playbackKeys(
    key: SanitizedUserInput,
    $event: KeyboardEvent
  ): Promise<boolean> {
    switch (key) {
      case 'enter':
        VODPlayback.swallowEvent($event);

        if ($event.repeat) {
          return;
        }

        this.openOverlay(true);
        return true;

      case UserInputEvent.Play:
        this.safePlay();
        return true;

      case UserInputEvent.Pause:
        this.player?.nativeElement?.pause();
        this.openOverlay(true);
        return true;

      case UserInputEvent.PlayPause:
        // Don't wait for the playback to start to be done
        this.togglePlay().then();
        return true;
      case 'escape':
      case UserInputEvent.Stop:
      case UserInputEvent.Back:
        this.returnToMenu().then();
        return true;
      default:
        return false;
    }
  }

  /**
   * Handles key presses that happen in overlay mode
   * @param key
   * @param $event
   */
  private async overlayKeys(
    key: SanitizedUserInput
    // $event: KeyboardEvent
  ): Promise<boolean> {
    switch (key) {
      case UserInputEvent.PlayPause:
      case UserInputEvent.Play:
        this.closeOverlay();
        this.safePlay();
        return true;

      case UserInputEvent.Back:
      case 'escape':
        this.closeOverlay();
        return true;

      default:
        return false;
    }
  }

  /**
   * Handler for a keydown
   * @param e
   * @param key
   * @returns A Promise that is true when event was handled otherwise it is
   *          false
   */
  protected async handleKeydown(
    e: KeyboardEvent,
    key: SanitizedUserInput = this.safeKey.tryKeyLowercase(e)
  ): Promise<boolean> {
    const handled: boolean = this.overlayIsOpen()
      ? await this.overlayKeys(key)
      : await this.playbackKeys(key, e);

    return handled ? true : await this.commonKeys(key, e);
  }

  // Lifecycle helpers
  /**
   * Cleans up potential memory leaks and restores state
   * @protected
   */
  protected dispose() {
    // Clean up memory
    this.closeOverlay(); // Clean up overlay
    this.disposeOfProgress();
    this.subs.forEach(x => x?.unsubscribe());

    this.playSubscription?.unsubscribe(); // Destroy any pending play

    // Fix state
    this.store.dispatch(new FullscreenDisableAction());
    this.active.resume();
  }
}
