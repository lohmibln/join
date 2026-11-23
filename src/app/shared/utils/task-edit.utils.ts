import { SubTask, Task } from '../models/task.model';
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
 * The category stays as it is, subtasks keep their checked state.
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
        sub_tasks: mergeSubtaskTexts(task.sub_tasks, values.subtasks),
    };
}

/**
 * Turns the edited subtask texts back into subtasks. The list only changes by one
 * step at a time (add at the end, rename or delete one), so the checked state
 * of the other subtasks is kept.
 * @param before - Subtasks of the task before editing.
 * @param texts - Subtask texts after editing.
 * @returns Subtasks with their checked state.
 */
export function mergeSubtaskTexts(before: SubTask[], texts: string[]): SubTask[] {
    if (texts.length > before.length) {
        const added = texts.slice(before.length).map((description) => ({ description, checked: false }));
        return [...before, ...added];
    }
    if (texts.length < before.length) {
        const removed = before.findIndex((sub, i) => sub.description !== texts[i]);
        return mergeSubtaskTexts(before.filter((_, i) => i !== removed), texts);
    }
    return before.map((sub, i) => ({ ...sub, description: texts[i] }));
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