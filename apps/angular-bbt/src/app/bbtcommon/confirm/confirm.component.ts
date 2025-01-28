import { Component, Input, OnInit } from '@angular/core';
import { Content } from '../content';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'bbt-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.less']
})
export class ConfirmComponent implements OnInit {
  @Input() content: Content;

  constructor(private modal: ModalComponent) {}
  open() {
    this.modal.open();
  }
  close() {
    this.modal.close();
  }
  ngOnInit() {}
}
