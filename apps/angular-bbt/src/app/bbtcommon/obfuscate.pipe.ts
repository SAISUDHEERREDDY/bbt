import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'obfuscate'
})
export class ObfuscatePipe implements PipeTransform {
  transform(value: string | { toString(): () => string }, char = '•'): string {
    const s = typeof value === 'string' ? value : value.toString();
    return new Array(s.length + 1).join(char);
  }
}
