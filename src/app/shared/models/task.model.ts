export type TaskStatus = 'todo' | 'inProgress' | 'awaitFeedback' | 'done';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
}
