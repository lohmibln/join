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
