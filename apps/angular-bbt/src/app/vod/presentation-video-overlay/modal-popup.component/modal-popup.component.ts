import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-popup',
  templateUrl: './modal-popup.component.html',
  styleUrls: ['./modal-popup.component.scss'],
})
export class ModalPopupComponent {
  @Input() isModalOpen: boolean = false; // Input to control modal visibility
  @Input() selectedIndex: number; // Input for selected index
  @Input() files: any[]; // Input for files

  @Output() closeModalEvent = new EventEmitter<void>(); // Output to close the modal
  @Output() jumpToSlideEvent = new EventEmitter<number>(); // Output to handle slide jump
  closeModal() {
    this.closeModalEvent.emit(); // Emit event to close the modal
  }

  handleJumpToSlide(index: number) {
    this.jumpToSlideEvent.emit(index); // Emit event to handle slide jump
  }
}