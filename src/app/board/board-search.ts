import { Task, TaskStatus } from '../shared/models/task.model';

/** Minimum characters before the board search filters tasks (same as reference). */
export const BOARD_SEARCH_MIN_LENGTH = 3;

/** Copy for board search empty states. */
export const BOARD_SEARCH_NO_RESULTS = 'No results found';
export const BOARD_SEARCH_EMPTY_COLUMN = 'No tasks';
export const BOARD_SEARCH_PLACEHOLDER = 'Find Task';

/** Reads the current value from a search input event. */
export function readSearchInputValue(event: Event): string {
  return (event.target as HTMLInputElement).value;
}

/** Whether the board should apply search filtering. */
export function isBoardSearchActive(query: string): boolean {
  return query.trim().length >= BOARD_SEARCH_MIN_LENGTH;
}

/** True if the task title or description contains the query (case-insensitive). */
export function taskMatchesSearch(task: Task, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }

  const title = task.title?.toLowerCase() ?? '';
  const description = task.description?.toLowerCase() ?? '';
  return title.includes(needle) || description.includes(needle);
}

/**
 * Filters tasks by title/description when the query is long enough.
 * Empty or short queries return all tasks (same behaviour as the reference).
 */
export function filterTasksBySearch(tasks: Task[], query: string): Task[] {
  if (!isBoardSearchActive(query)) {
    return tasks;
  }

  return tasks.filter((task) => taskMatchesSearch(task, query));
}

/** True when search is active and no tasks matched. */
export function hasNoBoardSearchResults(isSearchActive: boolean, visibleCount: number): boolean {
  return isSearchActive && visibleCount === 0;
}

/** Groups tasks into the four board columns by status. */
export function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const map: Record<TaskStatus, Task[]> = {
    toDo: [],
    inProgress: [],
    awaitFeedback: [],
    done: [],
  };

  for (const task of tasks) {
    map[task.status].push(task);
  }

  return map;
}
