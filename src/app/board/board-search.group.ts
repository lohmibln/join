import { Task, TaskStatus } from '../shared/models/task.model';

/** Groups tasks into the four board columns by status. */
export function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const map: Record<TaskStatus, Task[]> = {
    todo: [],
    inProgress: [],
    awaitFeedback: [],
    done: [],
  };

  for (const task of tasks) {
    map[task.status].push(task);
  }

  return map;
}
