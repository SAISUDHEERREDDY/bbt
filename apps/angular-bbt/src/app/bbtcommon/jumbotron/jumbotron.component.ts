import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'bbt-jumbotron',
  templateUrl: './jumbotron.component.html',
  styleUrls: ['./jumbotron.component.scss']
})
export class JumbotronComponent implements OnInit {
  @Input() showFade = true;
  @Input() previewOnly = false;

  constructor() {}

  ngOnInit() {}
}
