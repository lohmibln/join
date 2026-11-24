import { TaskStatus } from '../shared/models/task.model';

export interface BoardColumn {
  status: TaskStatus;
  title: string;
}

export const BOARD_COLUMNS: BoardColumn[] = [
  { status: 'toDo', title: 'To do' },
  { status: 'inProgress', title: 'In progress' },
  { status: 'awaitFeedback', title: 'Await feedback' },
  { status: 'done', title: 'Done' },
];

/** Columns a task can be moved to (excludes its current status). */
export function moveTargetsForStatus(current: TaskStatus): BoardColumn[] {
  return BOARD_COLUMNS.filter((column) => column.status !== current);
}
