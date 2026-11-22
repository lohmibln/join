import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { TaskStatus } from '../shared/models/task.model';
import { ContactsService } from '../shared/services/contacts.service';
import { AddTaskFormComponent } from './add-task-form/add-task-form.component';

const TASK_STATUSES: TaskStatus[] = ['toDo', 'inProgress', 'awaitFeedback', 'done'];

/**
 * Add Task page from the main menu. The board links here on small screens
 * and passes the column as ?status=..., so the task starts in that column.
 */
@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [AddTaskFormComponent],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.scss',
})
export class AddTaskComponent implements OnInit, OnDestroy {
  private readonly contactsService = inject(ContactsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly status = toSignal(
    this.route.queryParamMap.pipe(map((params) => toTaskStatus(params.get('status')))),
    { initialValue: 'toDo' as TaskStatus },
  );

  /** Loads contacts and starts realtime updates. */
  async ngOnInit(): Promise<void> {
    await this.contactsService.loadContacts();
    this.contactsService.startRealtime();
  }

  /** Stops realtime updates. */
  ngOnDestroy(): void {
    this.contactsService.stopRealtime();
  }

  /** Shows the board with the new task after it was saved. */
  openBoard(): void {
    void this.router.navigate(['/board']);
  }
}

/**
 * Turns the status from the address into a valid column.
 * @param value - Status from the query parameter.
 * @returns The column, "toDo" if the value is missing or unknown.
 */
function toTaskStatus(value: string | null): TaskStatus {
  return TASK_STATUSES.find((status) => status === value) ?? 'toDo';
}
