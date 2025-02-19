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
    const rect = this.backButton.nativeElement.getBoundingClientRect();
    this.focusService.registerElements([this.backButton], [{ x: rect.left, y: rect.top }]); 
  }
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const key = event.key;
  
    switch (key) {
      case 'ArrowUp':
        // Check if focus is already on the backButton
        const backButtonIndex = this.focusService.findElementIndex(this.backButton);
        if (backButtonIndex === this.focusService.getFocusIndex()) {
          return; // Do nothing if focus is already on the backButton
        }
  
        // Store the current focus index before moving to the backButton
        this.previouslyFocusedIndex = this.focusService.getFocusIndex();
  
        // Move focus to the backButton
        if (backButtonIndex !== -1) {
          this.focusService.setFocus(backButtonIndex);
        }
        event.preventDefault();
        break;
  
      case 'ArrowDown':
        // Restore focus to the previously focused element
        if (this.previouslyFocusedIndex !== -1) {
          this.focusService.setFocus(this.previouslyFocusedIndex);
          this.previouslyFocusedIndex = -1; // Reset the previously focused index
        }
        event.preventDefault();
        break;
  
      // Handle other keys...
    }
  }
  goBack() {
    window.history.back();
  }

  ngOnDestroy() {
    this.focusService.clearRegisteredElements();
  }
}