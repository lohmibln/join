export type TaskStatus = 'todo' | 'inProgress' | 'awaitFeedback' | 'done';

export type TaskCategory = 'User Story' | 'Technical Task';

export type TaskPriority = 'Urgent' | 'Medium' | 'Low';

export interface SubTask {
  description: string;
  checked: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  status: TaskStatus;
  prio: TaskPriority;
  due_date: string;
  assigned_to: string[];
  sub_tasks: SubTask[];
}
