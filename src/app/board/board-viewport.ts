/** Board switches to stacked columns / move-menu below this width. */
export const BOARD_MOBILE_MAX_WIDTH = 1023;

/** True when the board should use the mobile layout (move menu + long-press drag). */
export function isBoardMobileViewport(width = window.innerWidth): boolean {
  return width <= BOARD_MOBILE_MAX_WIDTH;
}

/** Board shows the columns as stacked rows that scroll sideways below this width. */
export const BOARD_ROW_LAYOUT_MAX_WIDTH = 1279;

/** True when each column is a sideways scrolling row of cards. */
export function isBoardRowLayout(width = window.innerWidth): boolean {
  return width <= BOARD_ROW_LAYOUT_MAX_WIDTH;
}
