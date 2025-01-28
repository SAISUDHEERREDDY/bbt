import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { Content } from '../../bbtcommon/content';
import { I18nService } from '../../i18n/i18n.service';
import {
  FullscreenDisableAction,
  FullscreenEnableAction
} from '../../reducers/pseudoFullscreen/action';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../../reducers';
import { OnDemandContentService } from '../../content-model/on-demand-content.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'bbt-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements AfterViewInit, OnDestroy {
  public data$: Observable<Content[]>;
  searchField = '';
  //adding for navigation
  @ViewChildren('card') cards: QueryList<ElementRef>;
  representativeChild: ElementRef = null;
  @ViewChild('raw') containment: ElementRef = null;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private i18n: I18nService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<ApplicationState>,
    private api: OnDemandContentService
  ) {
    this.store.dispatch(new FullscreenEnableAction());
  }

  ngAfterViewInit() {
    this.cards.changes.subscribe(() => {
      if (this.cards && this.cards.first) {
        // Set representative child and trigger changes
        this.representativeChild = this.cards.first;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  getData() {
    this.data$ = this.api.search(this.searchField);
  }

  onKeySend($event: string) {
    switch ($event) {
      case 'space': {
        this.searchField += ' ';
        break;
      }
      case 'backspace': {
        this.searchField = this.searchField.slice(
          0,
          this.searchField.length - 1
        );
        break;
      }
      case 'search': {
        this.getData();
        break;
      }
      default: {
        this.searchField += $event;
        break;
      }
    }
  }
  ngOnDestroy() {
    this.store.dispatch(new FullscreenDisableAction());
  }
}
