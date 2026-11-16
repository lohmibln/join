import { Task } from '../shared/models/task.model';
import { BOARD_SEARCH_MIN_LENGTH } from './board-search.constants';
import { taskMatchesSearch } from './board-search.match';

/** Whether the board should apply search filtering. */
export function isBoardSearchActive(query: string): boolean {
  return query.trim().length >= BOARD_SEARCH_MIN_LENGTH;
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
