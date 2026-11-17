import { NewTask, TaskCategory, TaskPriority, TaskStatus } from '../models/task.model';

export const REQUIRED_MESSAGE = 'This field is required';
export const PAST_DATE_MESSAGE = 'The due date cannot be in the past';
export const INVALID_DATE_MESSAGE = 'Please enter a valid date';

export interface TaskFormValues {
  title: string;
  description: string;
  dueDate: string;
  prio: TaskPriority;
  assignedTo: string[];
  category: TaskCategory | '';
  subtasks: string[];
}

export type TaskRequiredField = 'title' | 'dueDate' | 'category';

export type TaskFormErrors = Record<TaskRequiredField, string>;

export const EMPTY_TASK_ERRORS: TaskFormErrors = { title: '', dueDate: '', category: '' };

/**
 * Creates the start values of the form. "Medium" is preselected.
 * @returns Empty form values.
 */
export function createEmptyTaskValues(): TaskFormValues {
  return {
    title: '',
    description: '',
    dueDate: '',
    prio: 'Medium',
    assignedTo: [],
    category: '',
    subtasks: [],
  };
}

/**
 * Gets today's date in the format of a date input (yyyy-mm-dd), in local time.
 * @returns Today as text.
 */
export function getTodayIsoDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * Checks the due date: required, a real date and not in the past.
 * @param value - Value of the date input (yyyy-mm-dd).
 * @returns Error message, or an empty text if the date is fine.
 */
export function validateDueDate(value: string): string {
  if (!value) {
    return REQUIRED_MESSAGE;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return INVALID_DATE_MESSAGE;
  }
  return value < getTodayIsoDate() ? PAST_DATE_MESSAGE : '';
}

/**
 * Checks one required field of the form.
 * @param field - Field to check.
 * @param values - All form values.
 * @returns Error message, or an empty text if the field is fine.
 */
export function validateTaskField(field: TaskRequiredField, values: TaskFormValues): string {
  if (field === 'dueDate') {
    return validateDueDate(values.dueDate);
  }
  return values[field].trim() ? '' : REQUIRED_MESSAGE;
}

/**
 * Checks all required fields of the form.
 * @param values - All form values.
 * @returns Error message per field.
 */
export function validateTaskForm(values: TaskFormValues): TaskFormErrors {
  return {
    title: validateTaskField('title', values),
    dueDate: validateTaskField('dueDate', values),
    category: validateTaskField('category', values),
  };
}

/**
 * Checks whether at least one field has an error.
 * @param errors - Error message per field.
 * @returns True if the form cannot be saved.
 */
export function hasTaskErrors(errors: TaskFormErrors): boolean {
  return Object.values(errors).some((message) => message !== '');
}

/**
 * Builds the task for Supabase from the form values.
 * @param values - Valid form values.
 * @param status - Board column the task starts in.
 * @returns Task data without id.
 */
export function buildNewTask(values: TaskFormValues, status: TaskStatus): NewTask {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    category: values.category as TaskCategory,
    status,
    prio: values.prio,
    due_date: values.dueDate,
    assigned_to: values.assignedTo,
    sub_tasks: values.subtasks.map((description) => ({ description, checked: false })),
  };
}
