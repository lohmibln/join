import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Task, TaskStatus } from '../shared/models/task.model';
import { ContactsService } from '../shared/services/contacts.service';
import { BOARD_COLUMNS } from './board-columns';
import { applyTaskStatusChange } from './board-dnd.apply';
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
import { DEMO_TASKS } from './demo-tasks';
import { TaskCardComponent } from './task-card/task-card.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [TaskCardComponent, TaskDetailComponent, CdkDropListGroup, CdkDropList, CdkDrag],
  templateUrl: './board.component.html',
  styleUrls: [
    './board.component.scss',
    './board.responsive.scss',
    './board-dnd.styles.scss',
    './board-dnd.mobile.scss',
    './board-dnd.receiving.scss',
    './board-search.bar.scss',
    './board-search.no-results.scss',
    './board-search.responsive.scss',
  ],
})
export class BoardComponent implements OnInit, OnDestroy {
  private readonly contactsService = inject(ContactsService);

  readonly columns = BOARD_COLUMNS;
  readonly tasks = signal<Task[]>([...DEMO_TASKS]);
  readonly selectedTask = signal<Task | null>(null);
  readonly addTaskStatus = signal<TaskStatus | null>(null);
  readonly searchQuery = signal('');

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

  async ngOnInit(): Promise<void> {
    await this.contactsService.loadContacts();
    this.contactsService.startRealtime();
    this.assignDemoAssignees();
  }

  ngOnDestroy(): void {
    this.contactsService.stopRealtime();
  }

  onSearchInput(event: Event): void {
    this.searchQuery.set(readSearchInputValue(event));
  }

  openTask(task: Task): void {
    this.selectedTask.set(task);
  }

  closeTask(): void {
    this.selectedTask.set(null);
  }

  /** Toggles one subtask of the open task and refreshes the board cards. */
  onSubtaskToggle(index: number): void {
    const open = this.selectedTask();
    if (!open) {
      return;
    }
    const updated = this.withToggledSubtask(open, index);
    this.tasks.update((list) => list.map((t) => (t.id === updated.id ? updated : t)));
    this.selectedTask.set(updated);
  }

  /** Returns a copy of the task with the checked state of one subtask flipped. */
  private withToggledSubtask(task: Task, index: number): Task {
    const subTasks = task.sub_tasks.map((sub, i) =>
      i === index ? { ...sub, checked: !sub.checked } : sub,
    );
    return { ...task, sub_tasks: subTasks };
  }

  onAddTask(status: TaskStatus): void {
    // Placeholder until Add Task flow is implemented.
    this.addTaskStatus.set(status);
  }

  onDragStarted(): void {
    this.isDragging = true;
  }

  onDragEnded(): void {
    // Delay so the click from pointer-up after a drag is ignored.
    setTimeout(() => {
      this.isDragging = false;
    }, 0);
  }

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
    if (!task) {
      return;
    }

    const newStatus = statusFromDropListId(event.container.id);
    if (!newStatus || task.status === newStatus) {
      return;
    }

    this.tasks.update((list) => applyTaskStatusChange(list, task.id, newStatus));
  }

  /** Seeds demo cards with the first contacts so initials show on the board. */
  private assignDemoAssignees(): void {
    const contacts = this.contactsService.contacts();
    if (contacts.length === 0) {
      return;
    }

    const ids = contacts.slice(0, 4).map((c) => c.id);

    this.tasks.update((list) =>
      list.map((task, index) => ({
        ...task,
        assigned_to: ids.slice(0, (index % 3) + 1),
      })),
    );
  }
}
