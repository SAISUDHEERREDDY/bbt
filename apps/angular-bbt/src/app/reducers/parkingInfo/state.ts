export interface ParkingInfoState {
  enabled: boolean;
  /**
   * The timeout time in minutes
   */
  screenTimeout: number;
  files?: string[];
  paused: boolean;
}
