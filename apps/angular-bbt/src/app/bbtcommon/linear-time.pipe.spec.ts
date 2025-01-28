import { LinearTimePipe } from './linear-time.pipe';

describe('LinearTimePipe', () => {
  let pipe: LinearTimePipe;
  beforeEach(() => {
    pipe = new LinearTimePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format null as the default', () => {
    expect(pipe.transform(null)).toBe('00:00:00');
  });

  it('should format undefined as the default', () => {
    expect(pipe.transform(undefined)).toBe('00:00:00');
  });

  it('should format NaN as the default', () => {
    expect(pipe.transform(NaN)).toBe('00:00:00');
  });

  it('should format NaN as the default', () => {
    expect(pipe.transform(0)).toBe('00:00:00');
  });

  it('should pad single digit seconds', () => {
    expect(pipe.transform(1)).toBe('00:00:01');
  });

  it('should pad single digit minutes', () => {
    expect(pipe.transform(60)).toBe('00:01:00');
  });

  it('should pad single digit hours', () => {
    expect(pipe.transform(60 * 60)).toBe('01:00:00');
  });

  it('should add no padding to double digit seconds', () => {
    expect(pipe.transform(10)).toBe('00:00:10');
  });

  it('should add no padding to double digit minutes', () => {
    expect(pipe.transform(10 * 60)).toBe('00:10:00');
  });

  it('should add no padding to double digit hours', () => {
    expect(pipe.transform(10 * 60 * 60)).toBe('10:00:00');
  });

  it('should allow for more than two digits for hours', () => {
    expect(pipe.transform(100 * 60 * 60)).toBe('100:00:00');
  });
});
