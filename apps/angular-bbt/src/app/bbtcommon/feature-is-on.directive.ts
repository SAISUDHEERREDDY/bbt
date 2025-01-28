import { Input, OnDestroy, TemplateRef } from '@angular/core';
import { ViewContainerRef } from '@angular/core';
import { Directive } from '@angular/core';
import { Unsubscribable } from 'rxjs';
import { FeatureSwitchesService } from './feature-switches.service';
import { SwitchableFeature } from './SwitchableFeatures';

@Directive({
  selector: '[bbtFeatureIsOn]'
})
export class FeatureIsOnDirective implements OnDestroy {
  private hasView = false;

  private featureIsOn$: Unsubscribable = null;

  @Input('bbtFeatureIsOn') set featureIsOn(feature: SwitchableFeature) {
    // Destroy existing subscription
    this.featureIsOn$?.unsubscribe();

    // Create the subscription for the new feature
    this.featureSwitches
      .listenForFeatureChanges(feature)
      .subscribe(featureIsOn => {
        if (featureIsOn && !this.hasView) {
          this.viewContainer.createEmbeddedView(this.templateRef);
          this.hasView = true;
        } else if (!featureIsOn && this.hasView) {
          this.viewContainer.clear();
          this.hasView = false;
        }
      });
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private featureSwitches: FeatureSwitchesService
  ) {}

  ngOnDestroy(): void {
    this.featureIsOn$?.unsubscribe();
  }
}
