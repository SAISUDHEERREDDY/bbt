import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChange,
  SimpleChanges
} from '@angular/core';
import { of, Unsubscribable } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'bbt-live-description',
  templateUrl: './live-description.component.html',
  styleUrls: ['./live-description.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiveDescriptionComponent implements OnChanges, OnDestroy {
  @Input() channel;
  @Input() program;
  startWatcher: Unsubscribable;
  endWatcher: Unsubscribable;

  // Playing now has a getter and setter to manage change detection
  private _playingNow = false;
  get playingNow() {
    return this._playingNow;
  }
  set playingNow(val: boolean) {
    const changed = val === this._playingNow;
    this._playingNow = val;
    if (changed) {
      this.changeDetectorRef.detectChanges();
    }
  }

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  /**
   * Determines if the date is in a given range
   * @param start The start of the range to look for (inculsive)
   * @param end   The end of the range to look for (non-inclusive)
   * @returns     True if the date is in the range
   */
  private isInRange(start: Date, end: Date) {
    const now = Date.now();
    return start?.valueOf() <= now && now < end?.valueOf();
  }

  /**
   * Clears the watchers that update now playing
   */
  private clearWatchers() {
    this.startWatcher?.unsubscribe();
    this.endWatcher?.unsubscribe();
    this.startWatcher = null;
    this.endWatcher = null;
  }

  startWatchers(program) {
    // clear any existing watchers
    this.clearWatchers();

    this.playingNow = this.isInRange(program?.startTime, program?.endTime);

    const now = Date.now();

    // If the program will start in the future watch for that an update accordingly
    if (program?.startTime && now < program?.startTime) {
      this.startWatcher = of()
        .pipe(delay(program.startTime))
        .subscribe(() => (this.playingNow = true));
    }
    // If the program will end in the future watch for that an update accordingly
    if (program?.endTime && now < program?.endTime) {
      this.endWatcher = of()
        .pipe(delay(program.endTime))
        .subscribe(() => (this.playingNow = false));
    }
  }

  // Lifecycle Hooks
  ngOnDestroy(): void {
    this.clearWatchers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const now = Date.now();
    const newProgram = changes?.program?.currentValue;
    if (newProgram) {
      this.startWatchers(newProgram);
    }
  }
}
