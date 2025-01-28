import { GeneralAction } from '../GeneralAction.class';

export enum PseudoFullscreenTriggers {
  Enable = '[PseudoFullscreen] Enable',
  Disable = '[PseudoFullscreen] Disable',
  Toggle = '[PseudoFullscreen] Toggle'
}

export class FullscreenEnableAction extends GeneralAction<PseudoFullscreenTriggers> {
  constructor() {
    super(PseudoFullscreenTriggers.Enable);
  }
}

export class FullscreenDisableAction extends GeneralAction<PseudoFullscreenTriggers> {
  constructor() {
    super(PseudoFullscreenTriggers.Disable);
  }
}

export class FullscreenToggleAction extends GeneralAction<PseudoFullscreenTriggers> {
  constructor() {
    super(PseudoFullscreenTriggers.Toggle);
  }
}

export type FullscreenAction =
  | FullscreenEnableAction
  | FullscreenDisableAction
  | FullscreenToggleAction;
