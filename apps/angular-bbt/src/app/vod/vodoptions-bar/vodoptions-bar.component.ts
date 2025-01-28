import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnDestroy } from '@angular/core';
import { INavigableGroup } from '../../four-directional-navigation/navigable-group';
import { FormControl } from '@angular/forms';
import { FocusService } from '../../bbtcommon/service/focus.service';

@Component({
  selector: 'bbt-vodoptions-bar',
  templateUrl: './vodoptions-bar.component.html',
  styleUrls: ['./vodoptions-bar.component.less']
})
export class VODOptionsBarComponent {
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
    this.focusService.registerElements([this.backButton]);
  }
  goback(){
  window.history.back();
  }
  OnDestroy(){
    this.focusService.clearRegisteredElements();
  }
}
