import { Task } from '../shared/models/task.model';

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
