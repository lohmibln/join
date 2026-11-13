import { TaskStatus } from '../shared/models/task.model';

/** CDK drop-list id for a board column status. */
export function dropListIdForStatus(status: TaskStatus): string {
  return `${status}List`;
}

/** Resolves a CDK drop-list id back to a task status. */
export function statusFromDropListId(listId: string): TaskStatus | null {
  switch (listId) {
    case 'todoList':
      return 'todo';
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
