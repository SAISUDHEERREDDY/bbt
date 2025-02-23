import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { INavigableGroup } from '../../four-directional-navigation/navigable-group';
import { FormControl } from '@angular/forms';
import { FocusService } from '../../bbtcommon/service/focus.service';
import { ApplicationState } from '../../reducers';
import { Store } from '@ngrx/store';
import { Unsubscribable } from 'rxjs';

@Component({
  selector: 'bbt-vodoptions-bar',
  templateUrl: './vodoptions-bar.component.html',
  styleUrls: ['./vodoptions-bar.component.less']
})
export class VODOptionsBarComponent implements AfterViewInit, OnDestroy {
  @ViewChild('backButton') backButton!: ElementRef<HTMLAnchorElement>;
  @Input() parent: INavigableGroup;

  @Input() backRoute: string | string[];
  @Input() fragment: string;
  @Output() back = new EventEmitter<void>();

  @Input() audioOptions: Iterable<any>;
  @Input() audioControl: FormControl;
  @Input() audioLabelAttribute = 'label';

  @Input() captionOptions: Iterable<any>;
  @Input() captionsControl: FormControl;
  private previouslyFocusedIndex: number = -1; 
  constructor(private store: Store<ApplicationState>,private focusService: FocusService) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.focusService.registerElements(0, [this.backButton]);     
    }, 0);
     
  }
 
  goBack() {
    window.history.back();
  }

  ngOnDestroy() {
    this.focusService.clearRegisteredElements();
  }
}