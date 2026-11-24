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

/** Below this width the board uses the mobile layout: bottom navigation, stacked rows, move menu and long-press drag. */
export const BOARD_MOBILE_MAX_WIDTH = 1279;

/** True when the board should use the mobile layout. */
export function isBoardMobileViewport(width = window.innerWidth): boolean {
  return width <= BOARD_MOBILE_MAX_WIDTH;
}
