import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavigableContainerComponent } from '../../four-directional-navigation/navigable-container/navigable-container.component';
import { select, Store } from '@ngrx/store';
import { ApplicationState } from '../../reducers';
import {
  FullscreenDisableAction,
  FullscreenEnableAction
} from '../../reducers/pseudoFullscreen/action';
import {
  preferredCaption,
  selectedContent,
  uniqueAudioFromSelectedContent,
  uniqueCaptionsFromSelectedContent,
  preferredAudio
} from '../../reducers/VODListing/selectors';
import { filter, map } from 'rxjs/operators';
import { AudioTrack, CaptionTrack } from '../../bbtcommon/content';
import { combineLatest, Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import {
  setPreferredAudio,
  setPreferredCaption
} from '../../reducers/VODListing/action';
import { SubManager } from '../../SubManager';
import { SafeKeyService } from '../../bbtcommon/safe-key.service';
import { UserInputEvent } from '../../bbtcommon/UserInputEvent';
import { Presentation, Video } from '../../content-model';
import { FocusService } from '../../bbtcommon/service/focus.service';

@Component({
  selector: 'bbt-content-landing-menu',
  templateUrl: './content-landing-menu.component.html',
  styleUrls: ['./content-landing-menu.component.scss']
})
export class ContentLandingMenuComponent implements OnDestroy, OnInit {
  @ViewChildren('playVideoButton, presentationButton, loginButton ,playImageButton,playStreamButton') buttons!: QueryList<ElementRef<HTMLAnchorElement>>;
  private currentFocusIndex = 0; // 0 for BACK, 1 for PLAY
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<ApplicationState>,
    private safeKey: SafeKeyService,
    private focusService: FocusService,
  ) {
    this.store.dispatch(new FullscreenEnableAction());
  }

  @ViewChild('navContainer') containment: NavigableContainerComponent = null;
  readonly subs = new SubManager();

  /**
   * The caption to prefer
   */
  preferredCaptions = new FormControl();
  preferredAudio = new FormControl();

  audioTracks$ = this.store.pipe(select(uniqueAudioFromSelectedContent));
  audioTrackLabels$ = this.audioTracks$.pipe(map(t => t?.map(x => x.label)));

  backRoute: string[] = ['../../../../../selection'];
  fragment = '';

  content$ = this.store.pipe(
    select(selectedContent),
    filter(x => Boolean(x))
  ) as Observable<Presentation | Video>;

  captions$ = this.store.pipe(select(uniqueCaptionsFromSelectedContent));

  captionsLabels$ = this.captions$.pipe(
    map(captions => captions.map(c => c.label))
  );
  

  ngAfterViewInit(): void {
  
    console.log("AfterInt()");
    // Delay the call to ensure ViewChild elements are available
    this.content$.subscribe((content) => {
      // Delay to ensure buttons are available in the QueryList
      setTimeout(() => this.setButtonFocus(content), 0);
    });
  }

  setButtonFocus(content) {
    let buttonToFocus: ElementRef<HTMLAnchorElement> | undefined;

    switch (content?.type) {
      case 'Video':
        buttonToFocus = this.buttons.find((button) => button.nativeElement.id === 'playVideoButton');
        
        break;
        case 'Stream':
        buttonToFocus = this.buttons.find((button) => button.nativeElement.id === 'playStreamButton');
        
        break;
        case 'Image':
          buttonToFocus = this.buttons.find((button) => button.nativeElement.id === 'playImageButton');
         
          break;
      case 'Presentation':
        buttonToFocus = this.buttons.find((button) => button.nativeElement.id === 'presentationButton');
       
        break;
      case 'Login':
        buttonToFocus = this.buttons.find((button) => button.nativeElement.id === 'loginButton');
       
        break;
      default:
        break;
    }

    if (buttonToFocus) {
      this.focusService.registerElements([buttonToFocus]);
      const currentElIndex = this.focusService.findElementIndex(buttonToFocus);
      this.focusService.setFocus(currentElIndex);
    }
  }

  thumbUrl$ = this.content$.pipe(
    map(x => x.customIcon || (x as any).thumb), // futureproofing,
    map(x => (x ? `url('${encodeURI(x)}')` : undefined))
  );

  // TODO: Bring parent back
  // parent$ = this.content$.pipe(
  //   switchMap(content => {
  //     // get parent path
  //     const steps = content.path.split('/');
  //     // Drop off the content
  //     const path = steps?.slice(0, steps?.length - 1)?.join('');

  //     return this.store.pipe(select(selectNameInPath, { path }));
  //   })
  // );

  /**
   * Helper function to update a form control given all the values
   * @param control   The form control to update
   * @param value     The purposed value to update with
   * @param options   The options that can be set
   * @private
   */
  private static updateControlTrackValue<T extends { srclang: string }>(
    control: FormControl,
    value: T,
    options: Array<T>
  ) {
    const srcLang = control?.value?.srclang;

    // Guard against re-emitting
    if (value?.srclang === srcLang) {
      return;
    }

    // Handle purposed being null
    if (!value?.srclang && options?.length) {
      control.setValue(options[0]);
      return;
    }

    const langIndex = options.map(x => x.srclang).indexOf(value?.srclang);

    // Handle if language is found
    if (langIndex !== -1) {
      control.setValue(options[langIndex]);
      return;
    }

    // Set to first if there are any options at all
    if (options?.length > 0) {
      control.setValue(options[0]);
      return;
    }

    // Set to null otherwise
    control.setValue(null);
  }
  goBack(): void {
    // this.navigationService.navigateBack();
  }
  // Event Handlers
  @HostListener('window:keydown', ['$event'])
  keydown($event: KeyboardEvent) {
    const key = this.safeKey.tryKeyLowercase($event);
    if (key === 'escape' || key === UserInputEvent.Back) {
      this.goBack();
      // this.router
      //   .navigate(this.backRoute, {
      //     relativeTo: this.route,
      //     fragment: this.fragment
      //   })
      //   .then();
    }
  }

  // Angular Lifecycle Hooks
  ngOnInit() {
    // Setup subscriptions
    this.subs.addMany(
      // Set dropdowns to use state
      combineLatest([
        this.store.pipe(select(preferredCaption)),
        this.captions$
      ]).subscribe(([value, options]) => {
        ContentLandingMenuComponent.updateControlTrackValue(
          this.preferredCaptions,
          value,
          options
        );
      }),

      combineLatest([
        this.store.pipe(select(preferredAudio)),
        this.audioTracks$
      ]).subscribe(([value, tracks]) => {
        ContentLandingMenuComponent.updateControlTrackValue(
          this.preferredAudio,
          value,
          tracks
        );
      })
    );

    this.subs.onNext(this.preferredCaptions.valueChanges, (t: CaptionTrack) =>
      this.store.dispatch(setPreferredCaption(t))
    );
    this.subs.onNext(this.preferredAudio.valueChanges, (a: AudioTrack) =>
      this.store.dispatch(setPreferredAudio(a))
    );

    // this.subs.add(
    //   this.route.params.subscribe(params => {
    //     this.fragment = `menu-${params?.menuId}-item-${params.itemId}`;
    //     console.log("fragment", this.fragment);
      
    //   })
    // );
    this.content$.subscribe((content) => {
      // Use setTimeout to ensure elements are available
      setTimeout(() => this.setButtonFocus(content), 0);
    });
  }

  ngOnDestroy() {
    this.buttons =null;
    this.focusService.clearRegisteredElements()
    this.subs.destroy();
    this.store.dispatch(new FullscreenDisableAction());
    // localStorage.removeItem('presentationReloaded');
  }
}