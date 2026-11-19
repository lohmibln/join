import { Task } from '../models/task.model';
import { TaskFormValues } from './task-validation.utils';

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