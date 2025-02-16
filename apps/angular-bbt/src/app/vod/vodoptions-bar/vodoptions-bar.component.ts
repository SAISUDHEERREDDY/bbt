import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { INavigableGroup } from '../../four-directional-navigation/navigable-group';
import { FormControl } from '@angular/forms';
import { FocusService } from '../../bbtcommon/service/focus.service';

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

  constructor(private focusService: FocusService) {}

  ngAfterViewInit() {
    const rect = this.backButton.nativeElement.getBoundingClientRect();
    console.log('Back Button Position:', { x: rect.left, y: rect.top }); // Debugging
    this.focusService.registerElements([this.backButton], [{ x: rect.left, y: rect.top }]);
  
    // Log all registered elements
    console.log('Registered Elements:', this.focusService.getRegisteredElements());
    // console.log('Registered Positions:', this.focusService.getRegisteredPositions());
  }
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const key = event.key;
  
    switch (key) {
      case 'ArrowUp':
        const backButtonIndex = this.focusService.findElementIndex(this.backButton);
        if (backButtonIndex !== -1) {
          this.focusService.setFocus(backButtonIndex); // Manually set focus to backButton
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