import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { I18nNameInputComponent } from './i18n-name-input/i18n-name-input.component';
import { I18nDescriptionInputComponent } from './i18n-description-input/i18n-description-input.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { I18nModule } from '../i18n/i18n.module';

@NgModule({
  declarations: [I18nNameInputComponent, I18nDescriptionInputComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    HttpClientModule,
    FormsModule,
    I18nModule // DragDropModule
  ],
  exports: [I18nNameInputComponent, I18nDescriptionInputComponent]
})

/**
 * We only want to load the .svg once and not for each content item so,
 * this is just a temporary solution until we decide where this should go.
 */
export class ItemLangModule {
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    matIconRegistry.addSvgIcon(
      'add-lang',
      domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/icons/icon-language-filled.svg'
      )
    );
  }
}
