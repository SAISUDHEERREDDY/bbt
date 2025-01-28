import { ParkingInfoAction, ParkingInfoTriggers } from './action';
import { ParkingInfoState } from './state';

export function parkingInfoReducer(
  state: ParkingInfoState,
  action: ParkingInfoAction
): ParkingInfoState {
  switch (action.type) {
    case ParkingInfoTriggers.Pause:
      return {
        ...state,
        paused: true
      };
    case ParkingInfoTriggers.Resume:
      return {
        ...state,
        paused: false
      };
    case ParkingInfoTriggers.Received:
      const newState = action.payload as ParkingInfoState;
      return {
        screenTimeout: 60,
        ...state,
        ...newState
      };
    case ParkingInfoTriggers.Request:
      return { ...state };
    default:
      return { ...state };
  }
}
