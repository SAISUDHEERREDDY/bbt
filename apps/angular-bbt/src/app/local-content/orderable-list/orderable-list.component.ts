import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';

import {
  moveItemInArray,
  CdkDropList,
  CdkDropListGroup,
  CdkDragEnter
} from '@angular/cdk/drag-drop';

import { Local } from '../../content-model/local';

import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'bbt-orderable-list',

  templateUrl: './orderable-list.component.html',
  styleUrls: ['./orderable-list.component.scss']
})
export class OrderableListComponent implements AfterViewInit {
  /**
   * The items to order
   */
  @Input() items?: Array<Local>;

  /**
   * The delete event of an item in the ordered list
   */
  @Output() deleteItem = new EventEmitter<Local>();

  /**
   * The update event of an item in the ordered list
   */
  @Output() updateItem = new EventEmitter<Local>();

  /**
   * The reorder event of an item in the ordered list
   */
  @Output() reorderItem = new EventEmitter<Local>();

  @ViewChild(CdkDropListGroup) listGroup: CdkDropListGroup<CdkDropList>;
  @ViewChild('listGroup') listGroupElRef: ElementRef;
  @ViewChild(CdkDropList) placeholder: CdkDropList;
  @ViewChild('dragPlaceholder') dragPlaceholderElRef: ElementRef;

  public target: CdkDropList;
  public targetIndex: number;
  public source: CdkDropList;
  public sourceIndex: number;
  public edit: string;
  public delete: string;

  ngAfterViewInit() {
    let phElement = this.placeholder.element.nativeElement;

    phElement.style.display = 'none';
    phElement.parentNode.removeChild(phElement);
  }

  dropped() {
    if (!this.target) return;

    const parent: HTMLElement = this.listGroupElRef.nativeElement;
    const phElement: HTMLElement = this.placeholder.element.nativeElement;
    const phElementIndex = __indexOf(parent.children, phElement);

    phElement.style.display = 'none';
    parent.removeChild(phElement);
    parent.appendChild(phElement);

    parent.insertBefore(
      this.source.element.nativeElement,
      parent.children[this.sourceIndex]
    );

    if (this.sourceIndex != phElementIndex) {
      moveItemInArray(this.items, this.sourceIndex, phElementIndex);
      const item = this.items[phElementIndex];
      item.order = phElementIndex + 1;
      this.reorderItem.emit(item);
    }

    this.target = null;
    this.targetIndex = undefined;
    this.source = null;
    this.sourceIndex = undefined;
  }

  entered({ item, container }: CdkDragEnter) {
    const phElement: HTMLElement = this.placeholder.element.nativeElement;
    const dropElement: HTMLElement = container.element.nativeElement;
    const prevTarget: CdkDropList = this.target;
    const prevTargetIndex: number = this.targetIndex;
    this.target = container;

    const dropElementIsTheSource: boolean = !dropElement.parentNode;
    const prevAndCurrentTargetAreTheSame: boolean = this.target === prevTarget;
    if (dropElementIsTheSource || prevAndCurrentTargetAreTheSame) {
      return;
    }

    this.targetIndex = __indexOf(dropElement.parentNode.children, dropElement);

    if (!this.source) {
      this.source = item.dropContainer;
      this.sourceIndex = __indexOf(
        dropElement.parentNode.children,
        item.dropContainer.element.nativeElement
      );
      const sourceElement: HTMLElement = this.source.element.nativeElement;

      this.fixPhElementStyling(phElement, sourceElement);

      sourceElement.parentNode.removeChild(sourceElement);
    }

    const index: number = prevTargetIndex ?? this.sourceIndex;
    const insertAfter: boolean = index < this.targetIndex;

    this.listGroupElRef.nativeElement.insertBefore(
      phElement,
      insertAfter ? dropElement.nextSibling : dropElement
    );
  }

  dragReleased() {
    const phElementPositionWasChanged: boolean = !!this.source;
    if (phElementPositionWasChanged) {
      this.dragPlaceholderElRef.nativeElement.style.transform = 'none';
      this.dragPlaceholderElRef.nativeElement.parentNode.removeChild(
        this.dragPlaceholderElRef.nativeElement
      );
      this.placeholder.element.nativeElement.appendChild(
        this.dragPlaceholderElRef.nativeElement
      );
    }
  }

  private fixPhElementStyling(
    phElement: HTMLElement,
    sourceElement: HTMLElement
  ) {
    phElement.style.width = sourceElement.clientWidth - 6 + 'px';
    phElement.style.height = sourceElement.clientHeight - 6 + 'px';

    const size = Array.from(sourceElement.classList).find(c =>
      c.startsWith('content-item')
    );

    phElement.style.display = '';
  }
}

function __indexOf(collection, node) {
  return Array.prototype.indexOf.call(collection, node);
}
