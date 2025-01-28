import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { distinctUntilChanged, filter, first, map } from 'rxjs/operators';
import { ApplicationState } from '../reducers';
import { featureSwitches } from '../reducers/features/feature.selectors';
import {
  initializeFeatures,
  setFeatureSwitch
} from '../reducers/features/features.actions';
import { Features } from '../reducers/features/features.interface';
import { CrossMessageService } from './cross-message.service';
import { QmlService } from './qml.service';
import { SessionStorageService } from './session-storage.service';
import { SwitchableFeature } from './SwitchableFeatures';

@Injectable({
  providedIn: 'root'
})
export class FeatureSwitchesService {
  /**
   * A RegEx pattern to match a key
   */
  readonly featureKeyPattern = /feature\[(\w+)\]/;

  constructor(
    private qmlServce: QmlService,
    private crossMessagingService: CrossMessageService,
    private session: SessionStorageService,
    private store: Store<ApplicationState>
  ) {
    /**
     * Initialize from seesion store
     */
    const initialFeatures: Features = {};
    for (const [featureKey, rawValue] of session.matchKeys(
      this.featureKeyPattern
    )) {
      const parsedValue =
        rawValue === 'true' ? true : rawValue === 'false' ? false : undefined;
      if (typeof parsedValue === 'undefined') return; // Don't add undefined keys

      const parsedKey = this.readSwitchFromTag(featureKey as SwitchableFeature);
      initialFeatures[parsedKey] = parsedValue;
    }

    // Send the intialize event if there is anything to emit
    if (Object.getOwnPropertyNames(initialFeatures).length > 0) {
      this.store.next(initializeFeatures({ initialFeatures }));
    }

    /**
     * Listen for set feature switches
     */
    this.crossMessagingService.incomingMessages$
      .pipe(filter(x => x.messageType === 'SetFeatureSwitch'))
      .subscribe(x => this.set(x.feature, x.setting));
  }

  /**
   * Function that check other services and sets defaults.
   * Provided so that it can be called exactly once, so that lazy loaded
   * modules don't recall it.
   */
  detectPlatformFeatures() {
    this.setIfUnset('Live', true);

    // Get flags if they are not already set
    if (this.qmlServce.detectsQt) {
      this.setIfUnset('HughesRemote', true);
      this.setIfUnset('ParkingChannel', true);
    } else {
      this.setIfUnset('ManageContent', true);
    }

    /**
     * Auto-set Navigables to true if a remote layout is enabled
     */
    if (this.get('LGRemote') || this.get('HughesRemote')) {
      this.setIfUnset('Navigables', true);
    }
  }

  /**
   * Sets the value of a feature switch
   * @param feature The feature to set
   * @param setting A boolean value to set the feature to
   */
  set(feature: SwitchableFeature, setting: boolean) {
    this.session.setItem(this.tagSwitch(feature) as SwitchableFeature, setting);
    this.store.next(setFeatureSwitch({ feature, setting }));
  }

  /**
   * Sets the value only if another value is not already set.
   * This is meant to be used to default values while respecting what might
   * already be in storage intentionally.
   */
  setIfUnset(feature: SwitchableFeature, setting: boolean) {
    if (this.get(feature) === null) {
      this.set(feature, setting);
    }
  }

  /**
   * Get the setting of a feature switch
   * @param feature The Switchable feature to check
   * @returns The setting of the feature or null if the feature isn't found
   */
  get(feature: SwitchableFeature) {
    let state: boolean = null;

    /**
     * Subscribes such that the Observable completes immediately.
     */
    this.store
      .pipe(select(featureSwitches))
      .pipe(
        map(state => state?.[feature] ?? null),
        first()
      )
      .subscribe(s => (state = s));

    return state;
  }

  /**
   * Listens for changes to the feature switches
   * @param feature
   * @returns An observable that returns changes to the feature switch
   */
  listenForFeatureChanges(feature: SwitchableFeature) {
    return this.store.pipe(
      select(featureSwitches),
      map(state => state?.[feature]),
      distinctUntilChanged()
    );
  }

  /**
   * @param feature A switchable feature
   * @returns The formatted tagged switchable feature
   */
  private tagSwitch(feature: SwitchableFeature) {
    return `feature[${feature}]`;
  }

  /**
   * Read a feature from a feature tag
   * @param tagged
   * @returns The SwitchableFeature part of the tagged string
   */
  private readSwitchFromTag(tagged: string) {
    const match = tagged.match(this.featureKeyPattern);
    return match[1] as SwitchableFeature;
  }
}
