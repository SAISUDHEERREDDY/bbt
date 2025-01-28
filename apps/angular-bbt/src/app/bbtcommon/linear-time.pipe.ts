import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'linearTime'
})
export class LinearTimePipe implements PipeTransform {
  private static SECONDS_IN_MINUTE = 60;
  private static SECONDS_IN_HOUR = LinearTimePipe.SECONDS_IN_MINUTE * 60;

  /**
   * Formats one part of the string padding if needed
   * @private
   */
  private formatPart(n: number): string {
    return Math.floor(n).toString(10).padStart(2, '0');
  }

  transform(value: number): string {
    const failback = '00:00:00';

    if (!value || isNaN(value)) {
      return failback;
    }

    const hours = this.formatPart(value / LinearTimePipe.SECONDS_IN_HOUR);
    const minutes = this.formatPart(
      (value % LinearTimePipe.SECONDS_IN_HOUR) /
        LinearTimePipe.SECONDS_IN_MINUTE
    );
    const seconds = this.formatPart(value % LinearTimePipe.SECONDS_IN_MINUTE);

    return `${hours}:${minutes}:${seconds}`;
  }
}
