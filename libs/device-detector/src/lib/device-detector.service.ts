import { PLATFORM_ID, Inject, Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { detectIsTv } from './detect-is-tv';

export interface DeviceInfo {
  userAgent: string;
}
export enum DeviceType {
  TV = 'tv',
  WEB = 'web'
}

@Injectable({
  providedIn: 'root'
})
export class DeviceDetectorService {
  userAgent = '';
  deviceType: string;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      this.userAgent = window.navigator.userAgent;
    }
    this.setDeviceInfo(this.userAgent);
  }

  /**
   * @author Jeff Gorder
   * @desc Sets the initial value of the device when the service is initiated.
   * This value is later accessible for usage
   */
  setDeviceInfo(ua = this.userAgent): void {
    if (ua !== this.userAgent) {
      this.userAgent = ua;
    }

    this.deviceType = this.isTv() ? DeviceType.TV : DeviceType.WEB;
  }

  /**
   * @author Jeff Gorder
   * @desc Returns the device information
   * @returns the device information object.
   */
  public getDeviceInfo(): DeviceInfo {
    const deviceInfo: DeviceInfo = {
      userAgent: this.userAgent
    };
    return deviceInfo;
  }

  /**
   * @author Jeff Gorder
   * @desc Gets whether or not this is a smart tv
   * @returns whether the current device is smart tv device
   */
  public isTv(userAgent = this.userAgent): boolean {
    return detectIsTv(userAgent);
  }

  /**
   * @author Jeff Gorder
   * @desc Gets whether or not this is a smart tv
   * @returns whether the current device is smart tv device
   */
  public isWeb(): boolean {
    return !this.isTv();
  }
}
