import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { combineLatest, timer, Unsubscribable } from 'rxjs';
import { tap, map, startWith } from 'rxjs/operators';
import { I18nService } from '../../i18n/i18n.service';
import { SupportedLanguage } from '../../i18n/lang.types';

@Component({
  selector: 'bbt-heading-clock',
  templateUrl: './heading-clock.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./heading-clock.component.scss']
})
export class HeadingClockComponent implements OnDestroy, OnInit {
  public now: Date;
  private subscriptions = new Set<Unsubscribable>();
  public locale: SupportedLanguage = this.i18n.currentLang;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.changeDetectorRef.detach();

    // This block handles change detection manually. This is efficient in the
    // clock since change only occur if the language changes and on minute
    // barriers.
    const initial = new Date();
    const now$ = timer((60 - initial.getSeconds()) * 1000, 60000).pipe(
      startWith([initial]),
      map(() => new Date())
    );

    const detector$ = combineLatest([now$, this.i18n.currentLang$]).pipe(
      tap(([now, lang]) => {
        this.now = now;
        this.locale = lang;
        this.changeDetectorRef.detectChanges();
      })
    );

    this.subscriptions.add(detector$.subscribe());
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe()); // Clean subs
  }
}
