/** True when search is active and no tasks matched. */
export function hasNoBoardSearchResults(
  isSearchActive: boolean,
  visibleCount: number,
): boolean {
  return isSearchActive && visibleCount === 0;
}
