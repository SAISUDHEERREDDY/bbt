import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';

@Component({
  selector: 'bbt-linear-progress',
  templateUrl: './linear-progress.component.html',
  styleUrls: ['./linear-progress.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinearProgressComponent implements OnInit, OnDestroy {
  @Input() media: HTMLMediaElement;
  /**
   * Reference to the interval doing change detection
   */
  changeWatcher: any;

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.changeWatcher = setInterval(
      () => this.changeDetectorRef.detectChanges(),
      50
    );
  }

  ngOnDestroy(): void {
    clearInterval(this.changeWatcher);
  }
}
