import { Component, ElementRef, computed, inject, input, output, signal } from '@angular/core';
import { Contact } from '../../shared/models/contact.model';
import { ContactsService } from '../../shared/services/contacts.service';
import { getContactColor } from '../../shared/utils/contact.utils';

const MAX_VISIBLE_AVATARS = 3;

/**
 * Dropdown to assign contacts to a task. It can be filtered by typing
 * and closes again when the user clicks somewhere else.
 */
@Component({
  selector: 'app-assigned-to-select',
  standalone: true,
  templateUrl: './assigned-to-select.component.html',
  styleUrl: './assigned-to-select.component.scss',
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class AssignedToSelectComponent {
  private readonly contactsService = inject(ContactsService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly selectedIds = input<string[]>([]);
  readonly selectedIdsChange = output<string[]>();

  readonly isOpen = signal(false);
  readonly filter = signal('');

  readonly filteredContacts = computed(() => {
    const wanted = this.filter().trim().toLowerCase();
    return this.sortedContacts().filter((contact) =>
      contact.full_name.toLowerCase().includes(wanted),
    );
  });

  readonly selectedContacts = computed(() =>
    this.sortedContacts().filter((contact) => this.selectedIds().includes(contact.id)),
  );

  readonly visibleAvatars = computed(() => this.selectedContacts().slice(0, MAX_VISIBLE_AVATARS));

  readonly hiddenAvatarCount = computed(() =>
    Math.max(this.selectedContacts().length - MAX_VISIBLE_AVATARS, 0),
  );

  private readonly sortedContacts = computed(() =>
    [...this.contactsService.contacts()].sort((a, b) => a.full_name.localeCompare(b.full_name)),
  );

  /** Opens or closes the list. */
  toggle(): void {
    this.isOpen.update((open) => !open);
  }

  /**
   * Filters the list while the user types and opens it.
   * @param event - Input event of the search field.
   */
  onFilterInput(event: Event): void {
    this.filter.set((event.target as HTMLInputElement).value);
    this.isOpen.set(true);
  }

  /**
   * Adds the contact to the selection or removes it again.
   * @param contact - Clicked contact.
   */
  toggleContact(contact: Contact): void {
    const ids = this.selectedIds();
    const next = ids.includes(contact.id)
      ? ids.filter((id) => id !== contact.id)
      : [...ids, contact.id];
    this.selectedIdsChange.emit(next);
  }

  /**
   * Checks whether a contact is selected.
   * @param contact - Contact to check.
   * @returns True if the contact is assigned.
   */
  isSelected(contact: Contact): boolean {
    return this.selectedIds().includes(contact.id);
  }

  /**
   * Gets the avatar color of a contact.
   * @param contact - Contact of the avatar.
   * @returns CSS color value.
   */
  avatarColor(contact: Contact): string {
    return getContactColor(contact.name_shortcut_color_code);
  }

  /** Closes the list, e.g. with the Escape key. */
  close(): void {
    this.isOpen.set(false);
  }

  /**
   * Closes the list when the click was outside of this dropdown.
   * @param event - Click anywhere on the page.
   */
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
