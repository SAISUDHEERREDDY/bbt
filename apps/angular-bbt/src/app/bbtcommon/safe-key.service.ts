import { Injectable } from '@angular/core';
import { FeatureSwitchesService } from './feature-switches.service';
import { SanitizedUserInput, UserInputEvent } from './UserInputEvent';

@Injectable({
  providedIn: 'root'
})
export class SafeKeyService {
  constructor(private feature: FeatureSwitchesService) {}

  // Usable key readers

  /**
   * Takes input can converts it to an user input event or a string
   * for the keycode. Can attempt to use the platform to detect the input. At
   * least somewhat aware of platform, it will attempt to convert a raw input
   * into an enumerable value where possible.
   */
  tryKey(event: KeyboardEvent, failbackToKeyCode = true): SanitizedUserInput {
    if (this.feature.get('LGRemote')) {
      // On LGTV SmartTV
      const sanitized = this.sanitizeLGCodes(event);
      if (sanitized !== null) {
        return sanitized;
      }
    }

    if (this.feature.get('HughesRemote')) {
      // On HSMA
      const sanitized = this.sanitizeHughesRemoteCodes(event);
      if (sanitized !== null) {
        return sanitized;
      }
    }

    const safest = event.key.trim();
    if (safest !== '') return safest;

    if (failbackToKeyCode) {
      const parsedCode = String.fromCharCode(event.keyCode);
      console.error(
        `Couldn\'t get key event code from event.key failing back to keyCode ${event.keyCode} parsed ${parsedCode}`
      );

      return parsedCode;
    }

    return null;
  }

  /**
   * Handles the common case of wanting the input lowercase where applicable
   * @param event The Key event to read
   */
  tryKeyLowercase(
    event: KeyboardEvent,
    failbackToKeyCode = true
  ): SanitizedUserInput {
    const key = this.tryKey(event, failbackToKeyCode);
    return typeof key === 'string' ? key.toLowerCase() : key;
  }

  /**
   * Handles the case where if the key is a number we want the number back
   * instead of the key. Doesn't failback to keyCode number if code can't be
   * parsed to avoid type ambigiuity.
   */
  tryKeyNumber(event: KeyboardEvent): number | SanitizedUserInput {
    const key = this.tryKeyLowercase(event, false);

    if (typeof key === 'string' && (key as string).length === 1) {
      const num = Number.parseInt(key as string, 10);
      if (!Number.isNaN(num)) {
        return num;
      }
    }

    return key;
  }

  // Platform specific functions

  /**
   * Sanitizes codes specific to the LG remotes.
   * @param event
   * @returns
   */
  private sanitizeLGCodes(event) {
    // NOTE: At time of wiriting LGTVs running signage do not reliably return
    // events that can read the code property so the depricated keyCode is
    // used. Before attempting to change this, ensure that all TVs that must
    // be supported have changed this behavior.

    const keyCode = event?.keyCode;

    switch (keyCode) {
      case 19:
        return UserInputEvent.Pause;
      case 412:
        return UserInputEvent.Rewind;
      case 413:
        return UserInputEvent.Stop;
      case 415:
        return UserInputEvent.Play;
      case 417:
        return UserInputEvent.FastForward;
      default:
        return null;
    }
  }

  /**
   * Sanitizes the input from the hughes HSMA remote
   */
  private sanitizeHughesRemoteCodes(event: KeyboardEvent) {
    switch (event.key) {
      // Simple Remote (MSP-1765)
      case 'a':
        return UserInputEvent.Power;
      case 'b':
        return UserInputEvent.Home;
      case 'c': // Menu (Going to a menu in the context you are in)
        return UserInputEvent.Menu;
      case 'd': // Back
        return UserInputEvent.Back;
      case 'e': // PlayPause
        return UserInputEvent.PlayPause;
      case 'f':
        return UserInputEvent.VolumeDown;
      case 'g':
        return UserInputEvent.VolumeUp;
    }

    return null;
  }
}
