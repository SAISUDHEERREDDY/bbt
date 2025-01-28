import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from './i18n.service';

@Pipe({
  name: 'jqueryi18n'
})
export class Jqueryi18nPipe implements PipeTransform {
  constructor(private i18nService: I18nService) {}

  transform(value: string, args: string[] = []): string | undefined {
    return this.i18nService.translate(value, ...args);
  }
}
