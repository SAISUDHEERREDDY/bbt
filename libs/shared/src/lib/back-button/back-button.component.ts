import { Component, Input } from '@angular/core';

@Component({
  selector: 'shared-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss']
})
export class BackButtonComponent {
  /**
   * The route to return to
   */
  @Input() backTo = '/';
}
