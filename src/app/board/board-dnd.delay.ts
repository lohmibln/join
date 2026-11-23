/**
 * CDK drag start delay. Touch waits ~0.3s so sideways card scroll
 * on mobile does not immediately grab a task; mouse stays instant.
 */
export const BOARD_DRAG_START_DELAY = { touch: 300, mouse: 0 } as const;
