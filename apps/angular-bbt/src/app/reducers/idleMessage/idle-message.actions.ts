import { createAction, props } from '@ngrx/store';

const actionTag = '[Idleness]';

export const setIdleAfter = createAction(
  `${actionTag} Set Time`,
  props<{ idleAfter: number }>()
);

export const setIdling = createAction(`${actionTag} Idling`);
export const setActive = createAction(`${actionTag} Active`);
export const pauseIdleCountdown = createAction(`${actionTag} Pause`);
export const resumeIdleCountdown = createAction(`${actionTag} Resume`);
export const idleDisabled = createAction(`${actionTag} Idle Disabled`);
