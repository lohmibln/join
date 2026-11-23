import { Component, ElementRef, EventEmitter, Input, Output, inject, signal, viewChild } from '@angular/core';
import { Task } from '../../shared/models/task.model';
import { ContactsService } from '../../shared/services/contacts.service';
import { Contact } from '../../shared/models/contact.model';
import { getContactColor } from '../../shared/utils/contact.utils';
import { TaskEditFormComponent } from './task-edit-form/task-edit-form.component';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [TaskEditFormComponent],
  templateUrl: './task-detail.component.html',
  styleUrls: [
    './task-detail.component.scss',
    './task-detail.actions.scss',
    './task-detail.mobile.scss',
  ],
})
export class TaskDetailComponent {
  @Input({ required: true }) task!: Task;
  @Output() close = new EventEmitter<void>();
  @Output() subtaskToggled = new EventEmitter<number>();
  @Output() taskDeleted = new EventEmitter<void>();
  @Output() taskEdited = new EventEmitter<Task>();

  readonly isEditing = signal(false);

  private readonly contactsService = inject(ContactsService);
  private readonly scrollBox = viewChild<ElementRef<HTMLElement>>('scrollBox');

  /** Due date as dd/mm/yyyy (the stored ISO value stays unchanged). */
  get dueDateLabel(): string {
    const [year, month, day] = this.task.due_date.split('-');
    return year && month && day ? `${day}/${month}/${year}` : this.task.due_date;
  }

  /** Returns contacts assigned to the task (by id). */
  get assignedContacts(): Contact[] {
    const all = this.contactsService.contacts();
    return this.task.assigned_to
      .map((id) => all.find((c) => c.id === id))
      .filter((c): c is Contact => !!c);
  }

  /** Icon path for the task priority. */
  get prioIcon(): string {
    switch (this.task.prio) {
      case 'Urgent':
        return 'assets/icons/priority/urgent.svg';
      case 'Low':
        return 'assets/icons/priority/low.svg';
      default:
        return 'assets/icons/priority/medium.svg';
    }
  }

  /** Background color for a contact avatar. */
  avatarColor(contact: Contact): string {
    return getContactColor(contact.name_shortcut_color_code);
  }

  /** Closes the detail when the backdrop itself is clicked. */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  /** Emits the index of the clicked subtask so the parent can toggle it. */
  onSubtaskToggle(index: number): void {
    this.subtaskToggled.emit(index);
  }

  /** Shows the edit form instead of the task details. */
  startTaskEdit(): void {
    this.isEditing.set(true);
    this.resetScroll();
  }

  /** Scrolls the overlay content back to the top. */
  private resetScroll(): void {
    this.scrollBox()?.nativeElement.scrollTo({ top: 0 });
  }

  /**
   * Passes the edited task to the parent and shows the details again.
   * @param task - Task with the edited values.
   */
  onTaskSaved(task: Task): void {
    this.taskEdited.emit(task);
    this.isEditing.set(false);
    this.resetScroll();
  }
}
