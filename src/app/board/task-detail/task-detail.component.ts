import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { Task } from '../../shared/models/task.model';
import { ContactsService } from '../../shared/services/contacts.service';
import { Contact } from '../../shared/models/contact.model';
import { getContactColor } from '../../shared/utils/contact.utils';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss',
})
export class TaskDetailComponent {
  @Input({ required: true }) task!: Task;
  @Output() close = new EventEmitter<void>();
  @Output() subtaskToggled = new EventEmitter<number>();
  @Output() subtaskAdded = new EventEmitter<string>();
  @Output() subtaskRenamed = new EventEmitter<{ index: number; description: string }>();
  @Output() subtaskDeleted = new EventEmitter<number>();

  readonly draft = signal('');
  readonly editIndex = signal<number | null>(null);
  readonly editText = signal('');

  private readonly contactsService = inject(ContactsService);

  get assignedContacts(): Contact[] {
    const all = this.contactsService.contacts();
    return this.task.assigned_to
      .map((id) => all.find((c) => c.id === id))
      .filter((c): c is Contact => !!c);
  }

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

  avatarColor(contact: Contact): string {
    return getContactColor(contact.name_shortcut_color_code);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  /**
   * Stores the text of the new subtask.
   * @param event - Input event of the field.
   */
  onDraftInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }

  /**
   * Adds the typed subtask to the task. Empty text is ignored.
   * @param event - Optional key event, so Enter does not close or submit anything.
   */
  addSubtask(event?: Event): void {
    event?.preventDefault();
    const text = this.draft().trim();
    if (!text) return;
    this.subtaskAdded.emit(text);
    this.draft.set('');
  }

  /** Empties the field for a new subtask. */
  clearDraft(): void {
    this.draft.set('');
  }

  /** Emits the index of the clicked subtask so the parent can toggle it. */
  onSubtaskToggle(index: number): void {
    this.subtaskToggled.emit(index);
  }
}
