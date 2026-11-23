import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { Task, TaskStatus } from '../shared/models/task.model';
import { ContactsService } from '../shared/services/contacts.service';
import { TasksService } from '../shared/services/tasks.service';
import { ToastService } from '../shared/services/toast.service';
import { AddTaskDialogComponent } from './add-task-dialog/add-task-dialog.component';
import { BOARD_COLUMNS } from './board-columns';
import { withAddedSubtask, withRenamedSubtask, withoutSubtask } from './board-subtasks';
import { applyTaskStatusChange } from './board-dnd.apply';
import { BOARD_DRAG_START_DELAY } from './board-dnd.delay';
import { dropListIdForStatus, statusFromDropListId } from './board-dnd.ids';
import { taskFromDropEvent } from './board-dnd.task-from-drop';
import { filterTasksBySearch, isBoardSearchActive } from './board-search.filter';
import { groupTasksByStatus } from './board-search.group';
import { hasNoBoardSearchResults } from './board-search.has-no-results';
import {
  BOARD_SEARCH_EMPTY_COLUMN,
  BOARD_SEARCH_NO_RESULTS,
  BOARD_SEARCH_PLACEHOLDER,
} from './board-search.messages';
import { readSearchInputValue } from './board-search.read-input';
import { isBoardMobileViewport } from './board-viewport';
import { TaskCardComponent } from './task-card/task-card.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { TaskMoveMenuComponent } from './task-move-menu/task-move-menu.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    TaskCardComponent,
    TaskDetailComponent,
    TaskMoveMenuComponent,
    AddTaskDialogComponent,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
  ],
  templateUrl: './board.component.html',
  styleUrls: [
    './board.component.scss',
    './board.responsive.scss',
    './board-dnd.styles.scss',
    './board-dnd.mobile.scss',
    './board-dnd.receiving.scss',
    './board-dnd.preview-rotate.scss',
    './board-search.bar.scss',
    './board-search.no-results.scss',
    './board-search.responsive.scss',
    './board-add-task.button.scss',
    './board-columns.scroll.scss',
    './board.mobile.scss',
  ],
})
export class BoardComponent implements OnInit, OnDestroy {
  private readonly contactsService = inject(ContactsService);
  private readonly tasksService = inject(TasksService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly columns = BOARD_COLUMNS;
  readonly tasks = this.tasksService.tasks;
  readonly selectedTask = signal<Task | null>(null);
  readonly addTaskStatus = signal<TaskStatus | null>(null);
  readonly searchQuery = signal('');
  readonly isMobileBoard = signal(isBoardMobileViewport());
  readonly dragStartDelay = BOARD_DRAG_START_DELAY;

  readonly searchPlaceholder = BOARD_SEARCH_PLACEHOLDER;
  readonly noResultsMessage = BOARD_SEARCH_NO_RESULTS;
  readonly emptyColumnMessage = BOARD_SEARCH_EMPTY_COLUMN;

  /** True while a card is being dragged (avoids opening detail on drop). */
  private isDragging = false;

  readonly isSearchActive = computed(() => isBoardSearchActive(this.searchQuery()));

  readonly visibleTasks = computed(() =>
    filterTasksBySearch(this.tasks(), this.searchQuery()),
  );

  readonly tasksByStatus = computed(() => groupTasksByStatus(this.visibleTasks()));

  readonly hasNoSearchResults = computed(() =>
    hasNoBoardSearchResults(this.isSearchActive(), this.visibleTasks().length),
  );

  readonly dropListIdForStatus = dropListIdForStatus;

  /** Loads contacts and tasks and starts realtime updates. */
  async ngOnInit(): Promise<void> {
    this.isMobileBoard.set(isBoardMobileViewport());
    await Promise.all([this.contactsService.loadContacts(), this.tasksService.loadTasks()]);
    this.contactsService.startRealtime();
    this.tasksService.startRealtime();
  }

  /** Stops realtime updates. */
  ngOnDestroy(): void {
    this.contactsService.stopRealtime();
    this.tasksService.stopRealtime();
  }

  /** Updates the mobile flag when the window is resized. */
  @HostListener('window:resize')
  onWindowResize(): void {
    this.isMobileBoard.set(isBoardMobileViewport());
  }

  /** Stores the current search input value. */
  onSearchInput(event: Event): void {
    this.searchQuery.set(readSearchInputValue(event));
  }

  /** Opens the detail overlay for a task. */
  openTask(task: Task): void {
    this.selectedTask.set(task);
  }

  /** Closes the detail overlay. */
  closeTask(): void {
    this.selectedTask.set(null);
  }

  /** Deletes the open task, closes the detail and shows a message. */
  async onTaskDelete(): Promise<void> {
    const open = this.selectedTask();
    if (!open) {
      return;
    }
    this.closeTask();
    const deleted = await this.tasksService.deleteTask(open.id);
    this.toastService.show(deleted ? 'Task deleted' : this.tasksService.errorMessage());
  }

  /** Saves the edited task, keeps it open in the detail and shows a message. */
  async onTaskEdit(updated: Task): Promise<void> {
    const previous = this.selectedTask();
    this.selectedTask.set(updated);
    const saved = await this.tasksService.updateTask(updated);
    if (!saved && previous) this.selectedTask.set(previous);
    this.toastService.show(saved ? 'Task updated' : this.tasksService.errorMessage());
  }

  /** Toggles one subtask of the open task and refreshes the board cards. */
  onSubtaskToggle(index: number): void {
    const open = this.selectedTask();
    if (!open) {
      return;
    }
    this.applyTaskChange(this.withToggledSubtask(open, index));
  }

  /** Shows the changed task in the open detail and saves it. */
  private applyTaskChange(updated: Task): void {
    this.selectedTask.set(updated);
    void this.tasksService.updateTask(updated);
  }

  /** Adds a new subtask to the open task. */
  onSubtaskAdd(description: string): void {
    const open = this.selectedTask();
    if (open) {
      this.applyTaskChange(withAddedSubtask(open, description));
    }
  }

  /** Changes the text of one subtask of the open task. */
  onSubtaskRename(change: { index: number; description: string }): void {
    const open = this.selectedTask();
    if (open) {
      this.applyTaskChange(withRenamedSubtask(open, change.index, change.description));
    }
  }

  /** Deletes one subtask of the open task. */
  onSubtaskDelete(index: number): void {
    const open = this.selectedTask();
    if (open) {
      this.applyTaskChange(withoutSubtask(open, index));
    }
  }

  /** Returns a copy of the task with the checked state of one subtask flipped. */
  private withToggledSubtask(task: Task, index: number): Task {
    const subTasks = task.sub_tasks.map((sub, i) =>
      i === index ? { ...sub, checked: !sub.checked } : sub,
    );
    return { ...task, sub_tasks: subTasks };
  }

  /**
   * Opens the Add Task form for a column. Small screens get the Add Task page,
   * larger ones the dialog on top of the board.
   * @param status - Column the new task is added to.
   */
  onAddTask(status: TaskStatus): void {
    if (window.matchMedia('(max-width: 1023px)').matches) {
      void this.router.navigate(['/addTask'], { queryParams: { status } });
      return;
    }
    this.addTaskStatus.set(status);
  }

  /** Closes the Add Task dialog. */
  closeAddTask(): void {
    this.addTaskStatus.set(null);
  }

  /** Marks the start of a drag so the click is ignored. */
  onDragStarted(): void {
    this.isDragging = true;
  }

  /** Resets the drag flag after the drop click has passed. */
  onDragEnded(): void {
    // Delay so the click from pointer-up after a drag is ignored.
    setTimeout(() => {
      this.isDragging = false;
    }, 0);
  }

  /** Opens the task detail unless a drag just ended. */
  onTaskClick(task: Task): void {
    if (this.isDragging) {
      return;
    }
    this.openTask(task);
  }

  /**
   * Handles CDK drag-and-drop between board columns (desktop + mobile).
   * Same-column drops are ignored until task order is persisted.
   */
  onDrop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      return;
    }
    const task = taskFromDropEvent(event);
    const newStatus = statusFromDropListId(event.container.id);
    if (task && newStatus) {
      this.moveTaskToStatus(task, newStatus);
    }
  }

  /** Moves a task via the mobile move menu (fallback beside long-press drag). */
  onMobileMove(task: Task, newStatus: TaskStatus): void {
    this.moveTaskToStatus(task, newStatus);
  }

  /** Updates the task status locally and persists it. */
  private moveTaskToStatus(task: Task, newStatus: TaskStatus): void {
    if (task.status === newStatus) {
      return;
    }

    const moved = applyTaskStatusChange(this.tasks(), task.id, newStatus).find(
      (entry) => entry.id === task.id,
    );
    if (moved) void this.tasksService.updateTask(moved);
  }
}
