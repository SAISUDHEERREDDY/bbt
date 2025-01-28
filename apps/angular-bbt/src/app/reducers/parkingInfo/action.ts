import { GeneralAction } from '../GeneralAction.class';
import { ParkingInfoState } from './state';

export enum ParkingInfoTriggers {
  Received = '[Parking Info] Received',
  Request = '[Parking Info] Request',
  Pause = '[Parking Info] Pause',
  Resume = '[Parking Info] Resume'
}

export class RequestParkingInfo extends GeneralAction<ParkingInfoTriggers> {
  constructor() {
    super(ParkingInfoTriggers.Request);
  }
}

export class ReceivedParkingInfo extends GeneralAction<
  ParkingInfoTriggers,
  ParkingInfoState
> {
  constructor(payload: ParkingInfoState) {
    super(ParkingInfoTriggers.Received, payload);
  }
}

export class PauseParkingInfo extends GeneralAction<
  ParkingInfoTriggers,
  ParkingInfoState
> {
  constructor() {
    super(ParkingInfoTriggers.Pause);
  }
}

export class ResumeParkingInfo extends GeneralAction<
  ParkingInfoTriggers,
  ParkingInfoState
> {
  constructor() {
    super(ParkingInfoTriggers.Resume);
  }
}

export type ParkingInfoAction = RequestParkingInfo | ReceivedParkingInfo;
