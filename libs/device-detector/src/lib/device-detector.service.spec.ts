import { TestBed, waitForAsync } from '@angular/core/testing';
import { DeviceDetectorService } from './device-detector.service';
import { PLATFORM_ID } from '@angular/core';
import { tvAgent, nonTvAgent } from './detect-is-tv.spec';
describe('DeviceDetectorService', () => {
  let service: DeviceDetectorService;
  beforeEach(() => {
    service = new DeviceDetectorService(PLATFORM_ID);
  });
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [DeviceDetectorService]
      }).compileComponents();
    })
  );

  it('should have a service definition', () => {
    expect(DeviceDetectorService).toBeDefined();
  });

  it('isTv() should return true when user agent string contains "SmartTV"', () => {
    service.setDeviceInfo(tvAgent);
    expect(service.isTv()).toBeTrue();
  });

  it('isWeb() should return false when user agent string contains "SmartTV"', () => {
    service.setDeviceInfo(tvAgent);
    expect(service.isWeb()).toBeFalse();
  });

  it('isTv() should return false when user agent string does not contain "SmartTV"', () => {
    service.setDeviceInfo(nonTvAgent);
    expect(service.isTv()).toBeFalse();
  });

  it('isWeb() should return true when user agent string does not contain "SmartTV"', () => {
    service.setDeviceInfo(nonTvAgent);
    expect(service.isWeb()).toBeTrue();
  });
});
