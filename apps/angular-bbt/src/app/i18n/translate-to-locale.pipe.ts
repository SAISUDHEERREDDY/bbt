import { Pipe, PipeTransform } from '@angular/core';
import { SupportedLocale, TranslationMappingObject } from './lang.types';

@Pipe({
  name: 'translateToLocale'
})
export class TranslateToLocalePipe implements PipeTransform {
  transform(
    keys: TranslationMappingObject,
    locale: SupportedLocale,
    defaultTo: string = ''
  ): string {
    return keys?.[locale] ?? defaultTo;
  }
}
