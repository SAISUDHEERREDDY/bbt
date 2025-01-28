import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'parseInt',
  pure: true
})
/**
 * A simple pass through to Number.parseInt to make in template casting
 * possible in simple situations.
 */
export class ParseIntPipe implements PipeTransform {
  transform(value: number | string, radix: number = 10): number {
    return typeof value === 'number' ? value : Number.parseInt(value, radix);
  }
}
