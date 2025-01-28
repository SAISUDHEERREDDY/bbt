import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import { PresentationFile } from '../../bbtcommon/content';

@Component({
  selector: 'bbt-presentation-thumbs',
  templateUrl: './presentation-thumbs.component.html',
  styleUrls: ['./presentation-thumbs.component.scss']
})
export class PresentationThumbsComponent implements AfterViewInit {
  @ViewChildren('presentationThumb') thumbs: QueryList<ElementRef>;

  @Input() files: PresentationFile[];

  @Output()
  jumpToSlide = new EventEmitter<number>();

  // Selected index
  private _selectedIndex: number;
  @Input()
  get selectedIndex(): number {
    return this._selectedIndex;
  }

  set selectedIndex(i: number) {
    // Do nothing if identical
    if (i === this._selectedIndex) {
      return;
    }

    this._selectedIndex = i;
    this.scrollToSelectedThumb(i);
    // Scroll to selected index
  }

  constructor() {}

  ngAfterViewInit(): void {
    this.scrollToSelectedThumb(this.selectedIndex);
  }

  scrollToSelectedThumb(index: number) {
    // Do nothing if there are no thumbs to scroll
    if (!this.thumbs || this.thumbs?.length <= 1 || index === null) {
      return;
    }

    const active = this.thumbs.toArray()[index];
   
    if (!active) {
      throw new Error('Could find thumb to scroll to');
    }
    active.nativeElement.focus();
    active.nativeElement.scrollIntoView(true);
  }
  
}
