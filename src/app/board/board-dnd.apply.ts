import { Task, TaskStatus } from '../shared/models/task.model';

/**
 * Returns a new task list with the given task moved to `newStatus`.
 * Used after a cross-column CDK drag-and-drop.
 */
export function applyTaskStatusChange(
  tasks: Task[],
  taskId: string,
  newStatus: TaskStatus,
): Task[] {
  return tasks.map((task) =>
    task.id === taskId ? { ...task, status: newStatus } : task,
  );
}

/**
 * Returns a new task list where the task sits at a position of the given column.
 * The position counts the tasks of that column, so a drop between two cards
 * puts the task exactly there. A position behind the last card appends it.
 * @param tasks - All tasks in their current order.
 * @param taskId - Task that was dropped.
 * @param newStatus - Column the task was dropped into.
 * @param index - Position inside the column.
 * @returns The reordered list with the task in the new column.
 */
export function moveTaskInList(
  tasks: Task[],
  taskId: string,
  newStatus: TaskStatus,
  index: number,
): Task[] {
  const dropped = tasks.find((task) => task.id === taskId);
  if (!dropped) return tasks;
  const rest = tasks.filter((task) => task.id !== taskId);
  const column = rest.filter((task) => task.status === newStatus);
  const next = column[index];
  const last = column[column.length - 1];
  const at = next ? rest.indexOf(next) : last ? rest.indexOf(last) + 1 : rest.length;
  return [...rest.slice(0, at), { ...dropped, status: newStatus }, ...rest.slice(at)];
}
