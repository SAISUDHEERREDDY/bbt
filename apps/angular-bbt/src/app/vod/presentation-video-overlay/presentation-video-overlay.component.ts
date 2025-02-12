import {
  Component,
  Output,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewChildren,
  QueryList,
  ElementRef,
  HostListener
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { ApplicationState } from '../../reducers';
import { filter, map, switchMap } from 'rxjs/operators';
import { Observable, Unsubscribable } from 'rxjs';
import {
  ContentPresentation,
  PresentationFile,
  VideoContent
} from '../../bbtcommon/content';
import {
  uniqueFileAudioTracks,
  fileCaptions,
  selectNameInPath,
  selectedContent
} from '../../reducers/VODListing/selectors';
import { FormControl } from '@angular/forms';
import { LinearProgressComponent } from '../linear-progress/linear-progress.component';
import { Presentation, Video } from '../../content-model';
import { FocusService } from '../../bbtcommon/service/focus.service';

@Component({
  selector: 'bbt-presentation-video-overlay',
  templateUrl: './presentation-video-overlay.component.html',
  styleUrls: ['./presentation-video-overlay.component.scss']
})
export class PresentationVideoOverlayComponent implements OnInit, OnDestroy {
  private subs = new Set<Unsubscribable>();
  @ViewChild('previousTrackButton') previousTrackButton!: ElementRef;
  @ViewChild('rewindButton') rewindButton!: ElementRef;
  @ViewChild('playButton') playButton!: ElementRef;
  @ViewChild('fastForwardButton') fastForwardButton!: ElementRef;
  @ViewChild('nextTrackButton') nextTrackButton!: ElementRef;
  @ViewChild('focusSection') focusSection!: ElementRef;
  // @ViewChild('nextSlideButton') nextSlideButton!: ElementRef;
  // @ViewChild('previousSlideButton') previousSlideButton!: ElementRef;
  @Input() files: PresentationFile[];
  @Input() selected: PresentationFile;

  // Media pass thorough
  @Input() audioOptions: any[];
  @Input() captionOptions: any[];
  @Input() audioTracks: any[];
  @Input() currentTime: number;
  @Input() totalTime: number;
  @Input() mediaElement: HTMLMediaElement;

  // Selected index
  @Input()
  selectedIndex: number;
  isSectionFocused = false;
  // Outputs
  @Output() back = new EventEmitter<void>();
  @Output() jumpToSlide = new EventEmitter<number>();

  // Media Events
  @Output() play = new EventEmitter<void>();
  @Output() fastForward = new EventEmitter<void>();
  @Output() rewind = new EventEmitter<void>();
  @Output() nextTrack = new EventEmitter<void>();
  @Output() previousTrack = new EventEmitter<void>();
  @Output() nextSlide = new EventEmitter<void>();
  @Output() previousSlide = new EventEmitter<void>();
  @Output() audioTrackChanged = new EventEmitter<any>();
  @Output() captionTrackChanged = new EventEmitter<any>();

  @ViewChild(LinearProgressComponent) progress;

  @Input()
  captionControl: FormControl;

  @Input()
  audioControl: FormControl;

  showThumbs: boolean = false;

  audioTrackLabels$ = this.store.pipe(
    select(uniqueFileAudioTracks),
    map(t => t?.map(x => x.name))
  );

  content$ = this.store.pipe(
    select(selectedContent),
    filter(x => Boolean(x))
  ) as Observable<Presentation | Video>;

  audioTracks$ = this.store.pipe(select(uniqueFileAudioTracks));

  captions$ = this.store.pipe(select(fileCaptions));

  captionsLabels$ = this.captions$.pipe(
    map(captions => captions.map(c => c.label))
  );

  // TODO: Fix parent part
  // parent$ = this.content$.pipe(
  //   switchMap(content => {
  //     // get parent path
  //     const steps = content.path.split('/');
  //     // Drop off the content
  //     const path = steps?.slice(0, steps?.length - 1)?.join('');

  //     return this.store.pipe(select(selectNameInPath, { path }));
  //   })
  // );

  constructor(private store: Store<ApplicationState>, private focusService: FocusService) {}

  /**
   * Helper to handle triggering an EventEmitter
   */
  trigger(
    emitter:
      | 'play'
      | 'fastForward'
      | 'rewind'
      | 'nextTrack'
      | 'previousTrack'
      | 'nextSlide'
      | 'previousSlide',
    $event: KeyboardEvent = null
  ) {
    if ($event?.repeat) {
      return;
    }

    $event?.preventDefault();
    $event?.stopPropagation();

    this[emitter].emit();
  }

  // Angular lifecycle hooks
  ngOnInit(): void {
    this.subs.add(
      this.audioControl.valueChanges.subscribe(x => {
        // Guard against re-emission
        if (this.audioControl.value === x) {
          return;
        }

        this.audioTrackChanged.emit(x);
      })
    );

    this.subs.add(
      this.captionControl.valueChanges.subscribe(x => {
        // Guard against re-emission
        if (this.captionControl.value === x) {
          return;
        }

        this.captionTrackChanged.emit(x);
      })
    );
   
    
  }
  ngAfterViewInit(): void {
    this.registerMediaButtons();
  }
  registerMediaButtons() {
    // Collect all media buttons into an array and register them
    const elementsToRegister = [
      this.previousTrackButton,
      this.rewindButton,
      this.playButton,
      this.fastForwardButton,
      this.nextTrackButton,
      // this.nextSlideButton,
      // this.previousSlideButton
    ].filter((element) => element); // Filter out undefined elements (e.g., conditionally rendered)

    this.focusService.registerElements(elementsToRegister);
      const currentElIndex = this.focusService.findElementIndex(this.playButton);
      this.focusService.setFocus(currentElIndex);
  }
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' && !this.showThumbs) {
      // Show thumbs when ArrowDown is pressed and thumbs are not already visible
      this.showThumbs = true;
  
      // Focus on the thumbs section
     
    } else if (event.key === 'ArrowUp' && this.showThumbs) {
      // Hide thumbs when ArrowUp is pressed and focus is on the thumbs
      this.showThumbs = false;
      this.registerMediaButtons();
     
    }else if(event.key === "ArrowRight" && this.showThumbs){
      this.goToNextSlide();
    }else if(event.key === "ArrowLeft" && this.showThumbs){
      this.goToPreviousSlide();
    }else if(event.key === "e"){
      this.trigger('play', event)
    }
  }
  goToNextSlide() {
    if (this.selectedIndex < this.files.length - 1) {
      this.selectedIndex++;
    }
  }

  goToPreviousSlide() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
    }
  }
 
  ngOnDestroy(): void {
    this.focusService.clearRegisteredElements();
    this.subs.forEach(u => u.unsubscribe());
  }
}
