import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Task, TaskStatus } from '../shared/models/task.model';

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
 * CDK drag start delay. Touch waits ~0.15s so sideways card scroll
 * on mobile does not immediately grab a task; mouse stays instant.
 */
export const BOARD_DRAG_START_DELAY = { touch: 150, mouse: 0 } as const;

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

/** Minimum characters before the board search filters tasks (same as reference). */
export const BOARD_SEARCH_MIN_LENGTH = 3;

/** Copy for board search empty states. */
export const BOARD_SEARCH_NO_RESULTS = 'No results found';
export const BOARD_SEARCH_EMPTY_COLUMN = 'No tasks';
export const BOARD_SEARCH_PLACEHOLDER = 'Find Task';

/** Reads the current value from a search input event. */
export function readSearchInputValue(event: Event): string {
  return (event.target as HTMLInputElement).value;
}

/** Whether the board should apply search filtering. */
export function isBoardSearchActive(query: string): boolean {
  return query.trim().length >= BOARD_SEARCH_MIN_LENGTH;
}

/** True if the task title or description contains the query (case-insensitive). */
export function taskMatchesSearch(task: Task, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }

  const title = task.title?.toLowerCase() ?? '';
  const description = task.description?.toLowerCase() ?? '';
  return title.includes(needle) || description.includes(needle);
}

/**
 * Filters tasks by title/description when the query is long enough.
 * Empty or short queries return all tasks (same behaviour as the reference).
 */
export function filterTasksBySearch(tasks: Task[], query: string): Task[] {
  if (!isBoardSearchActive(query)) {
    return tasks;
  }

  return tasks.filter((task) => taskMatchesSearch(task, query));
}

/** True when search is active and no tasks matched. */
export function hasNoBoardSearchResults(isSearchActive: boolean, visibleCount: number): boolean {
  return isSearchActive && visibleCount === 0;
}

/** Groups tasks into the four board columns by status. */
export function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const map: Record<TaskStatus, Task[]> = {
    toDo: [],
    inProgress: [],
    awaitFeedback: [],
    done: [],
  };

  for (const task of tasks) {
    map[task.status].push(task);
  }

  return map;
}
