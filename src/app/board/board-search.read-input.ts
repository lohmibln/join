/** Reads the current value from a search input event. */
export function readSearchInputValue(event: Event): string {
  return (event.target as HTMLInputElement).value;
}
