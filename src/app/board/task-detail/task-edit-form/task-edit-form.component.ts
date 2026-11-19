import { Component, OnInit, input, output, signal } from '@angular/core';
import { Task } from '../../../shared/models/task.model';
import { toEditValues } from '../../../shared/utils/task-edit.utils';
import {
    TaskFormValues,
    createEmptyTaskValues,
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

    /** Fills the form with the data of the task. */
    ngOnInit(): void {
        this.values.set(toEditValues(this.task()));
    }
}