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

/**
 * Numbers the tasks in their current order, so that order can be saved.
 * @param tasks - Tasks in the order they should keep.
 * @returns Copies of the tasks with their place as position.
 */
export function withPositions(tasks: Task[]): Task[] {
  return tasks.map((task, index) => ({ ...task, position: index }));
}

/**
 * Finds the tasks that are new or have another status or position than before.
 * Only these have to be saved.
 * @param before - Tasks before the change.
 * @param after - Tasks after the change.
 * @returns The tasks of `after` that differ.
 */
export function changedTasks(before: Task[], after: Task[]): Task[] {
  const old = new Map(before.map((task) => [task.id, task]));
  return after.filter((task) => {
    const prev = old.get(task.id);
    return !prev || prev.position !== task.position || prev.status !== task.status;
  });
}
