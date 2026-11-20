import { Component, HostListener, input, output, signal } from '@angular/core';
import { TaskStatus } from '../../shared/models/task.model';
import { BoardColumn } from '../board-columns';
import { moveTargetsForStatus } from '../board-move-targets';

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

  get targets(): BoardColumn[] {
    return moveTargetsForStatus(this.currentStatus());
  }

  toggle(event: Event): void {
    event.stopPropagation();
    this.isOpen.update((open) => !open);
  }

  choose(event: Event, status: TaskStatus): void {
    event.stopPropagation();
    this.isOpen.set(false);
    this.moved.emit(status);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.isOpen.set(false);
  }
}
