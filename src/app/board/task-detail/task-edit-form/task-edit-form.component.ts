import { Component, OnInit, input, output, signal } from '@angular/core';
import { Task } from '../../../shared/models/task.model';
import { toEditValues } from '../../../shared/utils/task-edit.utils';
import {
    EMPTY_TASK_ERRORS,
    TaskFormValues,
    TaskRequiredField,
    createEmptyTaskValues,
    validateTaskField,
} from '../../../shared/utils/task-validation.utils';

/**
 * Form to edit the main details of an existing task. Shown in the task detail.
 */
@Component({
    selector: 'app-task-edit-form',
    standalone: true,
    templateUrl: './task-edit-form.component.html',
    styleUrl: './task-edit-form.component.scss',
})
export class TaskEditFormComponent implements OnInit {
    /** Task that is edited. */
    readonly task = input.required<Task>();
    readonly saved = output<Task>();

    readonly values = signal<TaskFormValues>(createEmptyTaskValues());
    readonly errors = signal(EMPTY_TASK_ERRORS);

    /** Fills the form with the data of the task. */
    ngOnInit(): void {
        this.values.set(toEditValues(this.task()));
    }

    /**
     * Stores the typed text and removes the error of that field.
     * @param field - Text field that was changed.
     * @param event - Input event of the field.
     */
    onInput(field: 'title' | 'description', event: Event): void {
        const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
        this.values.update((values) => ({ ...values, [field]: value }));
        if (field === 'title') this.clearError(field);
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
     * Removes the error of one field.
     * @param field - Field whose error is removed.
     */
    private clearError(field: TaskRequiredField): void {
        this.errors.update((errors) => ({ ...errors, [field]: '' }));
    }
}