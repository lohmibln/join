/** Board switches to stacked columns / move-menu below this width. */
export const BOARD_MOBILE_MAX_WIDTH = 1023;

/** True when the board should use the mobile layout (no Safari touch DnD). */
export function isBoardMobileViewport(width = window.innerWidth): boolean {
  return width <= BOARD_MOBILE_MAX_WIDTH;
}
