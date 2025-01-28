import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PasskeyProtectedLinkDirective } from './passkey-protected-link.directive';
import { RouterModule } from '@angular/router';
import { ContentModelModule } from '../content-model/content-model.module';

@NgModule({
  declarations: [PasskeyProtectedLinkDirective],
  exports: [PasskeyProtectedLinkDirective],
  imports: [CommonModule, RouterModule, ContentModelModule]
})
export class RouterExtensionModule {}
