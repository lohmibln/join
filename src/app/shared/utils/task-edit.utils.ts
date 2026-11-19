import { Task } from '../models/task.model';
import { TaskFormValues, validateDueDate } from './task-validation.utils';

/**
 * Turns a task into the values of the edit form.
 * @param task - Task that is edited.
 * @returns Form values filled with the task data.
 */
export function toEditValues(task: Task): TaskFormValues {
    return {
        title: task.title,
        description: task.description,
        dueDate: task.due_date,
        prio: task.prio,
        assignedTo: [...task.assigned_to],
        category: task.category,
        subtasks: task.sub_tasks.map((sub) => sub.description),
    };
}

/**
 * Copies the edited values into a copy of the task.
 * Category and subtasks stay as they are, subtasks are saved in the task detail.
 * @param task - Current task.
 * @param values - Valid form values.
 * @returns The changed copy of the task.
 */
export function applyEditValues(task: Task, values: TaskFormValues): Task {
    return {
        ...task,
        title: values.title.trim(),
        description: values.description.trim(),
        due_date: values.dueDate,
        prio: values.prio,
        assigned_to: values.assignedTo,
    };
}

/**
 * Checks the due date of an edited task. A date that was not changed is accepted,
 * even if it is in the past by now.
 * @param value - Value of the date input (yyyy-mm-dd).
 * @param original - Due date the task had before editing.
 * @returns Error message, or an empty text if the date is fine.
 */
export function validateEditedDueDate(value: string, original: string): string {
    return value && value === original ? '' : validateDueDate(value);
}