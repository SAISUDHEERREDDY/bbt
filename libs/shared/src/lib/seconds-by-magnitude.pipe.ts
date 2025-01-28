import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secondsByMagnitude',
  pure: true
})
/**
 * Converts seconds into time by magnitude up to the hour.
 * This code is largely copied from the MediaTraining project
 * seconds by magnitude filter and should eventually use the same
 * source of truth.
 */
export class SecondsByMagnitudePipe implements PipeTransform {
  private prependZero(num: number) {
    return num < 10 ? '0' + num : num;
  }

  transform(totalTime: number): string {
    // Return an empty string in empty cases
    if (
      Number.isNaN(totalTime) ||
      totalTime === undefined ||
      totalTime === null
    ) {
      return '';
    }

    const MINUTESINHOUR = 60;
    const SECONDSINMINUTE = 60;
    const hours = Math.floor(totalTime / (SECONDSINMINUTE * MINUTESINHOUR));

    const minutes = Math.floor(
      (totalTime % (SECONDSINMINUTE * MINUTESINHOUR)) / SECONDSINMINUTE
    );

    const seconds = Math.round(
      (totalTime % (SECONDSINMINUTE * MINUTESINHOUR)) % SECONDSINMINUTE
    );

    if (hours === 0) {
      return `${this.prependZero(minutes)}:${this.prependZero(seconds)}`;
    }

    return `${hours}:${this.prependZero(minutes)}:${this.prependZero(seconds)}`;
  }
}
