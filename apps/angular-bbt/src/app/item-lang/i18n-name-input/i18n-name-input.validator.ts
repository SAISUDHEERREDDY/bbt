import { AbstractControl } from '@angular/forms';
import { LangInput } from '../lang-input.interface';

export function I18nNameInputValidator(control: AbstractControl) {
  const titles = control.value as LangInput[];

  if (isNullOrUndefined(titles)) {
    return { error_key: 'TEXT_REQUIRED' };
  }

  for (const [lang, title] of Object.entries(titles)) {
    // If selected language is null or undefined, input is invalid
    if (isNullOrUndefined(lang) || isNullOrUndefined(title)) {
      return { error_key: 'TEXT_REQUIRED' };
    }
  }
  return null;
}

function isNullOrUndefined(value: any): boolean {
  return value === null || value === undefined || (value as string) === '';
}
