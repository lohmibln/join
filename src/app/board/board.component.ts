import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Task, TaskStatus } from '../shared/models/task.model';
import { ContactsService } from '../shared/services/contacts.service';
import { BOARD_COLUMNS } from './board-columns';
import { DEMO_TASKS } from './demo-tasks';
import { TaskCardComponent } from './task-card/task-card.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [TaskCardComponent, TaskDetailComponent],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss', './board.responsive.scss'],
})
export class BoardComponent implements OnInit, OnDestroy {
  private readonly contactsService = inject(ContactsService);

  readonly columns = BOARD_COLUMNS;
  readonly tasks = signal<Task[]>([...DEMO_TASKS]);
  readonly selectedTask = signal<Task | null>(null);
  readonly addTaskStatus = signal<TaskStatus | null>(null);

  readonly tasksByStatus = computed(() => {
    const map: Record<TaskStatus, Task[]> = {
      todo: [],
      inProgress: [],
      awaitFeedback: [],
      done: [],
    };

    for (const task of this.tasks()) {
      map[task.status].push(task);
    }

    return map;
  });

  async ngOnInit(): Promise<void> {
    await this.contactsService.loadContacts();
    this.contactsService.startRealtime();
    this.assignDemoAssignees();
  }

  ngOnDestroy(): void {
    this.contactsService.stopRealtime();
  }

  openTask(task: Task): void {
    this.selectedTask.set(task);
  }

  closeTask(): void {
    this.selectedTask.set(null);
  }

  onAddTask(status: TaskStatus): void {
    // Placeholder until Add Task flow is implemented.
    this.addTaskStatus.set(status);
  }

  /** Seeds demo cards with the first contacts so initials show on the board. */
  private assignDemoAssignees(): void {
    const contacts = this.contactsService.contacts();
    if (contacts.length === 0) {
      return;
    }

    const ids = contacts.slice(0, 4).map((c) => c.id);

    this.tasks.update((list) =>
      list.map((task, index) => ({
        ...task,
        assigned_to: ids.slice(0, (index % 3) + 1),
      })),
    );
  }
}
