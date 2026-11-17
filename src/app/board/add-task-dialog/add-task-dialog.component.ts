import { Component, input, output } from '@angular/core';
import { TaskStatus } from '../../shared/models/task.model';
import { AddTaskFormComponent } from '../../add-task/add-task-form/add-task-form.component';

/**
 * Add Task form as a dialog on the board (desktop).
 */
@Component({
  selector: 'app-add-task-dialog',
  standalone: true,
  imports: [AddTaskFormComponent],
  templateUrl: './add-task-dialog.component.html',
  styleUrl: './add-task-dialog.component.scss',
  host: { '(document:keydown.escape)': 'close()' },
})
export class AddTaskDialogComponent {
  /** Column the new task is added to. */
  readonly status = input<TaskStatus>('todo');
  readonly closed = output<void>();

  /** Closes the dialog. */
  close(): void {
    this.closed.emit();
  }

  /**
   * Closes the dialog when the dark background (not the dialog itself) is clicked.
   * @param event - Click event of the overlay.
   */
  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }
}
