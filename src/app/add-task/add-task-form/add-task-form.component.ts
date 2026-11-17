import { Component, inject, input, output, signal } from '@angular/core';
import { Task, TaskCategory, TaskPriority, TaskStatus } from '../../shared/models/task.model';
import { TasksService } from '../../shared/services/tasks.service';
import { ToastService } from '../../shared/services/toast.service';
import {
  EMPTY_TASK_ERRORS,
  TaskFormValues,
  TaskRequiredField,
  buildNewTask,
  createEmptyTaskValues,
  getTodayIsoDate,
  hasTaskErrors,
  validateTaskField,
  validateTaskForm,
} from '../../shared/utils/task-validation.utils';
import { AssignedToSelectComponent } from '../assigned-to-select/assigned-to-select.component';
import { CategorySelectComponent } from '../category-select/category-select.component';
import { SubtasksInputComponent } from '../subtasks-input/subtasks-input.component';

const SUCCESS_MESSAGE = 'Task added to board';

interface PrioOption {
  value: TaskPriority;
  icon: string;
  activeIcon: string;
}

/**
 * Form to create a new task. Used on the Add Task page and in the dialog on the board.
 */
@Component({
  selector: 'app-add-task-form',
  standalone: true,
  imports: [AssignedToSelectComponent, CategorySelectComponent, SubtasksInputComponent],
  templateUrl: './add-task-form.component.html',
  styleUrls: ['./add-task-form.component.scss', './add-task-form.responsive.scss'],
})
export class AddTaskFormComponent {
  private readonly tasksService = inject(TasksService);
  private readonly toastService = inject(ToastService);

  /** Board column the new task starts in. */
  readonly status = input<TaskStatus>('todo');
  /** In the dialog the left button closes it instead of clearing the form. */
  readonly isDialog = input(false);
  readonly created = output<Task>();
  readonly cancelled = output<void>();

  readonly values = signal<TaskFormValues>(createEmptyTaskValues());
  readonly errors = signal(EMPTY_TASK_ERRORS);
  readonly formError = signal('');
  readonly isSaving = signal(false);
  readonly today = getTodayIsoDate();

  readonly prioOptions: PrioOption[] = [
    { value: 'Urgent', icon: 'urgent', activeIcon: 'urgent-white' },
    { value: 'Medium', icon: 'medium', activeIcon: 'medium-white' },
    { value: 'Low', icon: 'low', activeIcon: 'low-white' },
  ];

  /**
   * Stores the typed text and removes the error of that field.
   * @param field - Text field that was changed.
   * @param event - Input event of the field.
   */
  onInput(field: 'title' | 'description' | 'dueDate', event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.values.update((values) => ({ ...values, [field]: value }));
    if (field !== 'description') this.clearError(field);
  }

  /**
   * Checks a required field when the user leaves it.
   * @param field - Field that lost focus.
   */
  onBlur(field: TaskRequiredField): void {
    const message = validateTaskField(field, this.values());
    this.errors.update((errors) => ({ ...errors, [field]: message }));
  }

  /**
   * Opens the date picker of the browser, so the whole field can be clicked.
   * @param event - Click on the date input.
   */
  openDatePicker(event: MouseEvent): void {
    const dateInput = event.currentTarget as HTMLInputElement;
    try {
      dateInput.showPicker();
    } catch {
      // Older browsers have no showPicker, there the native behaviour stays.
    }
  }

  /**
   * Selects a priority.
   * @param prio - Clicked priority.
   */
  selectPrio(prio: TaskPriority): void {
    this.values.update((values) => ({ ...values, prio }));
  }

  /**
   * Stores the contacts chosen in the assigned-to dropdown.
   * @param ids - Ids of the selected contacts.
   */
  onAssignedChange(ids: string[]): void {
    this.values.update((values) => ({ ...values, assignedTo: ids }));
  }

  /**
   * Stores the chosen category.
   * @param category - Category from the dropdown.
   */
  onCategoryChange(category: TaskCategory): void {
    this.values.update((values) => ({ ...values, category }));
    this.clearError('category');
  }

  /**
   * Stores the subtasks from the subtasks field.
   * @param subtasks - Texts of all subtasks.
   */
  onSubtasksChange(subtasks: string[]): void {
    this.values.update((values) => ({ ...values, subtasks }));
  }

  /** Resets every field to its start value. */
  clear(): void {
    this.values.set(createEmptyTaskValues());
    this.errors.set(EMPTY_TASK_ERRORS);
    this.formError.set('');
  }

  /**
   * Validates the form and saves the task if everything is filled in correctly.
   * @param event - Submit event of the form.
   */
  async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.isSaving()) return;
    const errors = validateTaskForm(this.values());
    this.errors.set(errors);
    if (hasTaskErrors(errors)) return;
    await this.save();
  }

  /**
   * Removes the error of one field and the general save error.
   * @param field - Field whose error is removed.
   */
  private clearError(field: TaskRequiredField): void {
    this.errors.update((errors) => ({ ...errors, [field]: '' }));
    this.formError.set('');
  }

  /**
   * Saves the task and blocks the button while the request is running.
   */
  private async save(): Promise<void> {
    this.isSaving.set(true);
    try {
      const task = await this.tasksService.addTask(buildNewTask(this.values(), this.status()));
      if (task) this.finish(task);
      else this.formError.set(this.tasksService.errorMessage());
    } finally {
      this.isSaving.set(false);
    }
  }

  /**
   * Shows the success toast, empties the form and tells the parent.
   * @param task - The saved task.
   */
  private finish(task: Task): void {
    this.toastService.show(SUCCESS_MESSAGE);
    this.clear();
    this.created.emit(task);
  }
}
