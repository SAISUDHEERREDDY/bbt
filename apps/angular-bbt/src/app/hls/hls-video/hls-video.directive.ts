import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  Output,
  Renderer2,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit
} from '@angular/core';
import Hls from 'hls.js';
import { HlsAudioTrack } from '../../vod/HlsAudioTrack';

@Directive({
  selector: '[bbtHlsVideo]',
  exportAs: 'HlsVideo'
})
export class HlsVideoDirective implements AfterViewInit, OnChanges, OnDestroy {
  private listeners = new Set<() => void>();

  // Source
  private _source: string;
  get source(): string {
    return this._source;
  }

  @Input('bbtHlsVideo') set source(src: string) {
    this._source = src;

    if (this.viewIsInitialized) {
      this.applySource(this._source);
    }
  }

  private _audioTrackId: number;

  @Input()
  get audioTrackId(): number {
    return this._audioTrackId;
  }

  set audioTrackId(id: number) {
    this._audioTrackId = id;
    this.updateAudioTrack(id);
  }

  @Output()
  readyToPlay = new EventEmitter();

  @Output()
  manifestParsed = new EventEmitter<{ audioTracks: HlsAudioTrack[] }>();

  @Output()
  subtitleTracksUpdated = new EventEmitter<{ tracks: any[]; hls: Hls }>();

  @Output()
  ended = new EventEmitter<void>();

  /**
   * Value to store if hls js isSupported
   * @private
   */
  private isSupported = null;

  /**
   * Local instance of hls
   */
  hls: Hls;

  /**
   * Native canPlayThrough listener
   * @private
   */
  private nativeCanPlayThroughListener: () => void;

  /**
   * Track is the view has been initialized so that it is clear
   * if the host is accessible
   */
  viewIsInitialized = false;

  constructor(
    private render: Renderer2,
    private video: ElementRef<HTMLVideoElement>
  ) {}

  /**
   * Hooks the native hls player
   * @param source
   * @private
   */
  private hookNativePlayer(source: string) {
    this.video.nativeElement.src = source;

    // Clear existing listeners
    this.listeners.forEach(x => x());
    this.listeners.clear();

    // Setup new listener
    const nativeMetaDataListener = this.render.listen(
      this.video?.nativeElement,
      'loadedmetadata',
      () => {
        // Play the video
        this.readyToPlay.emit();

        // Stop listening
        nativeMetaDataListener();
        this.listeners.delete(nativeMetaDataListener);
      }
    );
    this.listeners.add(nativeMetaDataListener);

    // Add end listener
    this.listeners.add(
      this.render.listen(this.video?.nativeElement, 'ended', () =>
        this.ended.emit()
      )
    );
  }

  /**
   * Attempts to play the video, listening for event that allow play if that
   * fails.
   */
  async play() {
    return this.video.nativeElement.play();
  }

  /**
   * Attempts to play the video, listening for event that allow play if that
   * fails.
   */
  pause() {
    return this.video?.nativeElement?.pause();
  }

  async togglePlay() {
    if (this.video?.nativeElement?.paused) {
      return this.play();
    } else {
      this.pause();
      return Promise.resolve();
    }
  }

  /**
   * Updates the audio track if the id is a valid option
   * @param id
   *
   * @private
   */
  private updateAudioTrack(id: number) {
    if (typeof id === 'number' && this?.hls?.audioTracks?.length > id) {
      this.hls.audioTrack = id;
    }
  }

  /**
   * Forces use of HLS js
   * @param source
   * @private
   */
  private setupHlsStream(source: string): void {
   // If hls already exists destroy it before recreating it.
   if (this.hls) {
    // Clear hls.js events

    this.hls.destroy();

    // Clear existing listeners
    this.listeners.forEach(x => x());
  }

  // Setup new hls video
  this.hls = new Hls({
    debug: false,
    maxBufferLength: 5,
    maxMaxBufferLength: 30
  });

  this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
    this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
      this.manifestParsed.emit({
        audioTracks: [...this.hls.audioTracks] as unknown as HlsAudioTrack[]
      });

      this.updateAudioTrack(this.audioTrackId);
    });

    this.hls.loadSource(source);
  });

  this.hls.attachMedia(this.video.nativeElement);
  }

  /**
   * Updates the video source cleaning up any existing assets
   * @param source
   * @private
   */
  private applySource(source: string) {
    // First check for native browser HLS support
    if (this.isSupported === null) {
      this.isSupported = Hls.isSupported();
    }

    if (this.isSupported) {
      if (this.isHlsStream(source)) {
      
      this.setupHlsStream(source);
      return;
    } else {
      this.setupMp4(source);
      return;
    }
     
    }

    // Fail back to native
    this.hookNativePlayer(source);
  }
  private isHlsStream(source: string): boolean {
    return source.endsWith('.m3u8');
  }
  private setupMp4(source: string): void {
    this.video.nativeElement.src = source;

    // Add listener for the ready event
    const readyListener = this.render.listen(this.video.nativeElement, 'loadedmetadata', () => {
      this.readyToPlay.emit();
      this.listeners.delete(readyListener);
    });

    this.listeners.add(readyListener);

    // Add listener for the ended event
    const endListener = this.render.listen(this.video.nativeElement, 'ended', () => {
      this.ended.emit();
      this.listeners.delete(endListener);
    });

    this.listeners.add(endListener);
  }

  /**
   * Helper method to be used by consumers to seek without access to base
   * elements.
   */
  seekTo(time: number) {
    if (this.video?.nativeElement?.currentTime === undefined) {
      throw new Error('Tried to seek, but video element was unavaiable');
    }
    this.video.nativeElement.currentTime = time;
  }

  // Angular Lifecycle Hooks
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.audioTrackId) {
      this.updateAudioTrack(changes.audioTrackId.currentValue);
    }
  }

  ngOnDestroy(): void {
    // Destroy hls js if it exist
    this.hls?.destroy();

    // Destroy the listeners
    this.listeners.forEach(x => x());
    this.listeners.clear();
  }

  ngAfterViewInit(): void {
    this.viewIsInitialized = true;

    if (this.source) {
      this.applySource(this.source);
    }
  }
}
