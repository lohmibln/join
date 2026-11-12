import { TaskStatus } from '../shared/models/task.model';

export interface BoardColumn {
  status: TaskStatus;
  title: string;
}

export const BOARD_COLUMNS: BoardColumn[] = [
  { status: 'todo', title: 'To do' },
  { status: 'inProgress', title: 'In progress' },
  { status: 'awaitFeedback', title: 'Await feedback' },
  { status: 'done', title: 'Done' },
];
