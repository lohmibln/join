import { Component, OnInit, input, output, signal } from '@angular/core';
import { Task, TaskPriority } from '../../../shared/models/task.model';
import {
  applyEditValues,
  toEditValues,
  validateEditedDueDate,
} from '../../../shared/utils/task-edit.utils';
import {
  EMPTY_TASK_ERRORS,
  TaskFormErrors,
  TaskFormValues,
  TaskRequiredField,
  createEmptyTaskValues,
  getTodayIsoDate,
  hasTaskErrors,
  validateTaskField,
} from '../../../shared/utils/task-validation.utils';
import { AssignedToSelectComponent } from '../../../add-task/assigned-to-select/assigned-to-select.component';
import { SubtasksInputComponent } from '../../../add-task/subtasks-input/subtasks-input.component';

interface PrioOption {
  value: TaskPriority;
  icon: string;
  activeIcon: string;
}

/**
 * Form to edit the main details of an existing task. Shown in the task detail.
 */
@Component({
  selector: 'app-task-edit-form',
  standalone: true,
  imports: [AssignedToSelectComponent, SubtasksInputComponent],
  templateUrl: './task-edit-form.component.html',
  styleUrls: ['./task-edit-form.component.scss', './task-edit-form.mobile.scss'],
})
export class TaskEditFormComponent implements OnInit {
  /** Task that is edited. */
  readonly task = input.required<Task>();
  readonly saved = output<Task>();

  readonly values = signal<TaskFormValues>(createEmptyTaskValues());
  readonly errors = signal(EMPTY_TASK_ERRORS);
  /** Earliest date the picker allows: today, or the old date if that is earlier. */
  minDate = getTodayIsoDate();

  readonly prioOptions: PrioOption[] = [
    { value: 'Urgent', icon: 'urgent', activeIcon: 'urgent-white' },
    { value: 'Medium', icon: 'medium', activeIcon: 'medium-white' },
    { value: 'Low', icon: 'low', activeIcon: 'low-white' },
  ];

  /** Fills the form with the data of the task. */
  ngOnInit(): void {
    this.values.set(toEditValues(this.task()));
    const original = this.task().due_date;
    if (original && original < this.minDate) this.minDate = original;
  }

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
    const message = this.validate(field);
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
   * Stores the subtasks after one was added, renamed or deleted.
   * @param subtasks - Texts of all subtasks.
   */
  onSubtasksChange(subtasks: string[]): void {
    this.values.update((values) => ({ ...values, subtasks }));
  }

  /**
   * Validates the form and tells the parent about the changed task.
   * @param event - Submit event of the form.
   */
  submit(event: Event): void {
    event.preventDefault();
    const errors = this.validateAll();
    this.errors.set(errors);
    if (hasTaskErrors(errors)) return;
    this.saved.emit(applyEditValues(this.task(), this.values()));
  }

  /**
   * Checks all required fields. The category is not editable, so it has no check.
   * @returns Error message per field.
   */
  private validateAll(): TaskFormErrors {
    return { title: this.validate('title'), dueDate: this.validate('dueDate'), category: '' };
  }

  /**
   * Validates one field. The due date is only checked for the past if it was changed.
   * @param field - Field to check.
   * @returns Error message, or an empty text if the field is fine.
   */
  private validate(field: TaskRequiredField): string {
    if (field === 'dueDate') {
      return validateEditedDueDate(this.values().dueDate, this.task().due_date);
    }
    return validateTaskField(field, this.values());
  }

  /**
   * Removes the error of one field.
   * @param field - Field whose error is removed.
   */
  private clearError(field: TaskRequiredField): void {
    this.errors.update((errors) => ({ ...errors, [field]: '' }));
  }
}
