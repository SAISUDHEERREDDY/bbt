import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';

import { HttpClient, HttpEventType } from '@angular/common/http';
import { ConfirmContentDeleteComponent } from '../confirm-content-delete/confirm-content-delete.component';
import { UpdateContentComponent } from '../update-content/update-content.component';

import { LocalContentService } from '../local-content.service';
import { tap, delay, filter, map, switchMap } from 'rxjs/operators';

import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { ApplicationState } from '../../reducers';
import { Local } from '../../content-model/local';
import {
  FullscreenDisableAction,
  FullscreenEnableAction
} from '../../reducers/pseudoFullscreen/action';
import { MatDialog } from '@angular/material/dialog';

import { interval, of, Unsubscribable } from 'rxjs';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'bbt-manage-content',

  templateUrl: './manage-content.component.html',
  styleUrls: ['./manage-content.component.scss']
})
export class ManageContentComponent implements AfterViewInit, OnDestroy {
  message: string;

  public data$ = this.localService.list();
  isLoading: boolean = this.localService.loading;

  isUploading: boolean;
  progress: number;
  size: number;
  left: number;
  @ViewChildren('card') cards: QueryList<ElementRef>;
  representativeChild: ElementRef = null;
  @ViewChild('raw') containment: ElementRef = null;

  subs = new Set<Unsubscribable>();

  constructor(
    private dialog: MatDialog,
    private updateDialog: MatDialog,

    private localService: LocalContentService,

    private changeDetector: ChangeDetectorRef,

    private store: Store<ApplicationState>,
    private i18n: I18nService
  ) {
    this.store.dispatch(new FullscreenEnableAction());
  }

  private messageHandler(mess: string) {
    this.message = mess;
    setTimeout(() => (this.message = null), 5000);
  }

  ngAfterViewInit() {
    this.subs.add(
      this.cards.changes.subscribe(() => {
        if (this.cards && this.cards.first) {
          // Set representative child and trigger changes
          this.representativeChild = this.cards.first;
          this.changeDetector.detectChanges();
        }
      })
    );
  }

  updateContent(content: Local) {
    this.updateDialog
      .open(UpdateContentComponent, {
        data: { content },
        panelClass: 'fullscreen-dialog',
        height: '100vh',
        width: '100%'
      })
      .afterClosed()
      .pipe(
        filter(result => !!result),
        switchMap(() => {
          if (content.pendingFile) {
            return this.localService.uploadThumbnail(content.pendingFile).pipe(
              map((res: any) => {
                if (res.file) {
                  const toReturn = { ...content, customIcon: res.file };

                  return toReturn;
                }
                return of(content);
              })
            );
          }
          return of(content);
        }),
        switchMap((result: Local) => {
          if (result) {
            return this.localService.updateContent(result);
          }
        })
      )
      .subscribe({
        complete: () => {
          this.messageHandler('Item successfully updated');
          this.data$ = this.localService.list();
        },
        error: ({ message }) => this.messageHandler(message)
      });
  }

  deleteContent(content: Local) {
    this.dialog
      .open(ConfirmContentDeleteComponent, {
        height: 'auto',
        data: { content }
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          this.localService.deleteContent(result).subscribe({
            complete: () => {
              this.messageHandler(this.i18n.i18n('ITEM_DELETED'));
              this.data$ = this.localService.list();
            },
            error: ({ message }) => this.messageHandler(message)
          });
        }
      });
  }

  reorderContent(content: Local) {
    this.localService.reorderContent(content).subscribe({
      complete: () => {},
      error: ({ message }) => console.log('error :>> ', message)
    });
  }

  uploadContent(item: any) {
    if (item) {
      this.progress = 0;
      this.isUploading = true;
      this.message = this.i18n.i18n('UPLOADING');
      this.size = 0;
      this.left = 100;
      this.localService
        .uploadContent(item)
        .pipe(
          tap(event => {
            if (this.progress >= 100) {
              this.message = this.i18n.i18n('CONVERTING');
              this.progress = 0;
              let timer = setInterval(() => {
                // estimate of conversion time is 100M/(1.5 seconds)
                // or 32M every 500ms (interval timer)
                this.left += 32000000; // 32M
                this.progress = Math.round((100 * this.left) / this.size);
                if (this.progress >= 100) {
                  this.progress = 99; // don't allow restart
                  clearInterval(timer);
                }
              }, 500);
            } else if (event.type === HttpEventType.UploadProgress) {
              this.progress = Math.round((100 * event.loaded) / event.total);
              if (this.size === 0) {
                this.size = event.total;
              }
            }
          }),
          delay(500)
        )
        .subscribe({
          complete: () => {
            this.isUploading = false;
            this.data$ = this.localService.list();
            this.messageHandler(this.i18n.i18n('ITEM_UPLOADED'));
          },
          error: ({ message }) => {
            this.isUploading = false;
            this.messageHandler(message);
          }
        });
    }
  }

  ngOnDestroy() {
    this.store.dispatch(new FullscreenDisableAction());
    this.subs.forEach(x => x.unsubscribe());
  }
}
