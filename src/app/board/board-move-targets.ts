import { TaskStatus } from '../shared/models/task.model';
import { BOARD_COLUMNS, BoardColumn } from './board-columns';

/** Columns a task can be moved to (excludes its current status). */
export function moveTargetsForStatus(current: TaskStatus): BoardColumn[] {
  return BOARD_COLUMNS.filter((column) => column.status !== current);
}
