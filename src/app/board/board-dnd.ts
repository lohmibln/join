import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Task, TaskStatus } from '../shared/models/task.model';

/** CDK drop-list id for a board column status. */
export function dropListIdForStatus(status: TaskStatus): string {
  return `${status}List`;
}

/** Resolves a CDK drop-list id back to a task status. */
export function statusFromDropListId(listId: string): TaskStatus | null {
  switch (listId) {
    case 'toDoList':
      return 'toDo';
    case 'inProgressList':
      return 'inProgress';
    case 'awaitFeedbackList':
      return 'awaitFeedback';
    case 'doneList':
      return 'done';
    default:
      return null;
  }
}

/**
 * CDK drag start delay. Touch waits ~0.3s so sideways card scroll
 * on mobile does not immediately grab a task; mouse stays instant.
 */
export const BOARD_DRAG_START_DELAY = { touch: 300, mouse: 0 } as const;

/** Reads the dragged task from a CDK drop event (`cdkDragData`). */
export function taskFromDropEvent(event: CdkDragDrop<Task[]>): Task | null {
  const task = event.item.data as Task | undefined;
  return task?.id ? task : null;
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
