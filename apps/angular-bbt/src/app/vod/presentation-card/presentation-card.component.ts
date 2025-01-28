import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'bbt-presentation-card',
  templateUrl: './presentation-card.component.html',
  styleUrls: ['./presentation-card.component.scss']
})
export class PresentationCardComponent implements OnInit {
  @Input() type: string;
  @Input() thumb: string;

  constructor() {}

  ngOnInit() {}
}
