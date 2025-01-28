import { PseudoFullscreenState } from './state';
import { FullscreenAction, PseudoFullscreenTriggers } from './action';

export function pseudoFullscreenReducer(
  state: PseudoFullscreenState,
  action: FullscreenAction
) {
  if (!action) return { ...state }; // Guard against bad actions

  switch (action.type) {
    case PseudoFullscreenTriggers.Disable:
      return { ...state, enabled: false };
    case PseudoFullscreenTriggers.Enable:
      return { ...state, enabled: true };
    case PseudoFullscreenTriggers.Toggle:
      return { ...state, enabled: !state.enabled };
    default:
      return { ...state };
  }
}
