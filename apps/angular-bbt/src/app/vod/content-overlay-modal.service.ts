import { Injectable } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { PresentationVideoOverlayComponent } from './presentation-video-overlay/presentation-video-overlay.component';
import { OverlayManager } from './overlay-manager';

@Injectable({
  providedIn: 'root'
})
export class ContentOverlayModalService {
  readonly smallShift = 10;
  readonly largeShift = 120;

  constructor(private overlay: Overlay) {}

  /**
   * Creates an overlay management object
   */
  create() {
    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .centerVertically();

    const overlayRef = this.overlay.create({ positionStrategy });
    const portal = new ComponentPortal(PresentationVideoOverlayComponent);

    return new OverlayManager<PresentationVideoOverlayComponent>(
      overlayRef,
      portal
    );
  }

  /**
   * Hooks Media Shifting Event applicable across various locations
   * @param manager
   * @param shifter Function that can achieve the media shift
   */
  hookVideoMediaShiftEvents(
    manager: OverlayManager<PresentationVideoOverlayComponent>,
    shifter: (number) => void
  ) {
    manager.onOutput('previousTrack', () => shifter(-this.largeShift));
    manager.onOutput('rewind', () => shifter(-this.smallShift));
    manager.onOutput('fastForward', () => shifter(this.smallShift));
    manager.onOutput('nextTrack', () => shifter(this.largeShift));
  }
}
