import { TestBed, waitForAsync } from '@angular/core/testing';
import { detectIsTv } from './detect-is-tv';

export const tvAgent =
  'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.34 Safari/537.36 WebAppManager';
export const nonTvAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36';

describe('detectIsTv', () => {
  it('should return true for tv agent', () => {
    expect(detectIsTv(tvAgent)).toBeTrue();
  });

  it('should return false for non-tv agent', () => {
    expect(detectIsTv(nonTvAgent)).toBeFalse();
  });
});
