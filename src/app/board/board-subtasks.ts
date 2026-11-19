import { Task } from '../shared/models/task.model';

/**
 * Returns a copy of the task with a new open subtask at the end.
 * @param task - Task that gets the subtask.
 * @param description - Text of the new subtask.
 * @returns The changed copy of the task.
 */
export function withAddedSubtask(task: Task, description: string): Task {
  return { ...task, sub_tasks: [...task.sub_tasks, { description, checked: false }] };
}

/**
 * Returns a copy of the task with a new text for one subtask.
 * @param task - Task that contains the subtask.
 * @param index - Position of the subtask.
 * @param description - New text of the subtask.
 * @returns The changed copy of the task.
 */
export function withRenamedSubtask(task: Task, index: number, description: string): Task {
  const subTasks = task.sub_tasks.map((sub, i) => (i === index ? { ...sub, description } : sub));
  return { ...task, sub_tasks: subTasks };
}

/**
 * Returns a copy of the task without one subtask.
 * @param task - Task that contains the subtask.
 * @param index - Position of the subtask.
 * @returns The changed copy of the task.
 */
export function withoutSubtask(task: Task, index: number): Task {
  return { ...task, sub_tasks: task.sub_tasks.filter((_, i) => i !== index) };
}
