import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Local } from '../../content-model/local';

@Component({
  selector: 'bbt-confirm-content-delete',
  templateUrl: './confirm-content-delete.component.html',
  styleUrls: ['./confirm-content-delete.component.scss']
})
export class ConfirmContentDeleteComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ConfirmContentDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { content: Local }
  ) {}

  ngOnInit() {}
}
