import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Jqueryi18nPipe } from './jqueryi18n.pipe';
import { I18NDirective } from './i18-n.directive';
import { TranslateToLocalePipe } from './translate-to-locale.pipe';

@NgModule({
  declarations: [Jqueryi18nPipe, I18NDirective, TranslateToLocalePipe],
  exports: [Jqueryi18nPipe, I18NDirective, TranslateToLocalePipe],
  imports: [CommonModule]
})
export class I18nModule {}
