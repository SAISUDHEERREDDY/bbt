import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bucket'
})
export class BucketPipe implements PipeTransform {
  transform<T>(original: T[], bucketSize: number): T[][] {
    const result = [];

    for (let i = 0; i < original.length; i = i + bucketSize) {
      result.push(original.slice(i, i + bucketSize));
    }

    return result;
  }
}
