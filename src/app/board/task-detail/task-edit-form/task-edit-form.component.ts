import { Component, OnInit, input, output, signal } from '@angular/core';
import { Task } from '../../../shared/models/task.model';
import { toEditValues, validateEditedDueDate } from '../../../shared/utils/task-edit.utils';
import {
    EMPTY_TASK_ERRORS,
    TaskFormValues,
    TaskRequiredField,
    createEmptyTaskValues,
    getTodayIsoDate,
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
    /** Earliest date the picker allows: today, or the old date if that is earlier. */
    minDate = getTodayIsoDate();

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