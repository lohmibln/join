import { Task } from '../models/task.model';

/**
 * Sorts the tasks by their saved position. Tasks without a position keep their
 * order and come behind the others.
 * @param tasks - Tasks in any order.
 * @returns A sorted copy of the list.
 */
export function sortTasksByPosition(tasks: Task[]): Task[] {
  const place = (task: Task): number => task.position ?? Number.MAX_SAFE_INTEGER;
  return [...tasks].sort((a, b) => place(a) - place(b));
}
