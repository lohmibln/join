import { Component, HostListener, input, output, signal } from '@angular/core';
import { TaskStatus } from '../../shared/models/task.model';
import { BOARD_COLUMNS, BoardColumn, moveTargetsForStatus } from '../board-columns';

@Component({
  selector: 'app-task-move-menu',
  standalone: true,
  imports: [],
  templateUrl: './task-move-menu.component.html',
  styleUrl: './task-move-menu.component.scss',
})
export class TaskMoveMenuComponent {
  readonly currentStatus = input.required<TaskStatus>();
  readonly moved = output<TaskStatus>();

  readonly isOpen = signal(false);

  /** Columns the task can be moved to. */
  get targets(): BoardColumn[] {
    return moveTargetsForStatus(this.currentStatus());
  }

  /** True for columns left of the task's column, they get an upward arrow. */
  isEarlier(status: TaskStatus): boolean {
    const order = BOARD_COLUMNS.map((column) => column.status);
    return order.indexOf(status) < order.indexOf(this.currentStatus());
  }

  /** Opens or closes the menu. */
  toggle(event: Event): void {
    event.stopPropagation();
    this.isOpen.update((open) => !open);
  }

  /** Closes the menu and reports the chosen status. */
  choose(event: Event, status: TaskStatus): void {
    event.stopPropagation();
    this.isOpen.set(false);
    this.moved.emit(status);
  }

  /** Closes the menu on any click outside. */
  @HostListener('document:click')
  onDocumentClick(): void {
    this.isOpen.set(false);
  }
}
