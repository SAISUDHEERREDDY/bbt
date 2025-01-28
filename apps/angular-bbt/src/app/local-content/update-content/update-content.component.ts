import { Component, Inject, OnInit, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Local } from '../../content-model/local';
import { I18nService } from '../../i18n/i18n.service';
@Component({
  selector: 'bbt-update-content',
  templateUrl: './update-content.component.html',
  styleUrls: ['./update-content.component.scss']
})
export class UpdateContentComponent implements OnInit {
  public imgURL: string | ArrayBuffer;

  constructor(
    public dialogRef: MatDialogRef<UpdateContentComponent>,
    public i18nService: I18nService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      content: Local;
    }
  ) {}

  preview(files) {
    if (files.length === 0) return;
    const reader = new FileReader();

    reader.readAsDataURL(files[0]);
    reader.onload = _event => {
      this.imgURL = reader.result;
      this.data.content.pendingThumb = reader.result;
      this.data.content.pendingFile = files[0];
    };
  }

  cancelThumb() {
    this.imgURL = this.data.content.customIcon;
    this.data.content.pendingThumb = undefined;
    this.data.content.pendingFile = undefined;
  }

  ngOnInit() {
    this.imgURL = this.data.content.customIcon;
  }
}
