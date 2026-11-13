import { Component, Input, inject } from '@angular/core';
import { Task } from '../../shared/models/task.model';
import { ContactsService } from '../../shared/services/contacts.service';
import { Contact } from '../../shared/models/contact.model';
import { getContactColor } from '../../shared/utils/contact.utils';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;

  private readonly contactsService = inject(ContactsService);

  /** Returns contacts assigned to this task (by id). */
  get assignedContacts(): Contact[] {
    const all = this.contactsService.contacts();
    return this.task.assigned_to
      .map((id) => all.find((c) => c.id === id))
      .filter((c): c is Contact => !!c);
  }

  /** Description preview truncated for the card. */
  get descriptionPreview(): string {
    const text = this.task.description?.trim() ?? '';
    if (text.length <= 60) {
      return text;
    }
    return `${text.slice(0, 60)}…`;
  }

  get subtaskProgress(): { done: number; total: number } {
    const total = this.task.sub_tasks?.length ?? 0;
    const done = this.task.sub_tasks?.filter((s) => s.checked).length ?? 0;
    return { done, total };
  }

  get progressPercent(): number {
    const { done, total } = this.subtaskProgress;
    return total === 0 ? 0 : (done / total) * 100;
  }

  get prioIcon(): string {
    switch (this.task.prio) {
      case 'Urgent':
        return 'assets/icons/priority/urgent-card.svg';
      case 'Low':
        return 'assets/icons/priority/low-card.svg';
      default:
        return 'assets/icons/priority/medium-card.svg';
    }
  }

  avatarColor(contact: Contact): string {
    return getContactColor(contact.name_shortcut_color_code);
  }
}
