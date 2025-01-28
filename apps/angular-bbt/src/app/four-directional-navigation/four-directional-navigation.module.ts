import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigableRootComponent } from './navigable-root.component';
import { NavigableRowDirective } from './navigable-row.directive';
import { FocusingNavigableDirective } from './focusing-navigable.directive';
import { ActivateAfterViewInitDirective } from './activate-after-view-init.directive';
import { ScrollParentOnFocusDirective } from './scroll-parent-on-focus.directive';
import { ScrollParentOnActivationDirective } from './scroll-parent-on-activation.directive';
import { NavigableContainerComponent } from './navigable-container/navigable-container.component';
import { DeferringNavigableDirective } from './deferring-navigable.directive';
import { IdleModule } from '../idle/idle.module';

@NgModule({
  declarations: [
    NavigableRootComponent,
    NavigableRowDirective,
    FocusingNavigableDirective,
    ActivateAfterViewInitDirective,
    ScrollParentOnFocusDirective,
    ScrollParentOnActivationDirective,
    NavigableContainerComponent,
    DeferringNavigableDirective
  ],
  exports: [
    NavigableRootComponent,
    NavigableRowDirective,
    FocusingNavigableDirective,
    ActivateAfterViewInitDirective,
    ScrollParentOnFocusDirective,
    ScrollParentOnActivationDirective,
    NavigableContainerComponent,
    DeferringNavigableDirective
  ],
  imports: [CommonModule, IdleModule]
})
export class FourDirectionalNavigationModule {}
