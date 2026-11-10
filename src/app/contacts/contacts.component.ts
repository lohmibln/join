import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Contact } from '../shared/models/contact.model';
import { ContactsService } from '../shared/services/contacts.service';
import { NavbarService } from '../shared/services/navbar.service';
import { groupContactsByLetter } from '../shared/utils/contact.utils';
import { ContactListComponent } from './contact-list/contact-list.component';
import { ContactDetailComponent } from './contact-detail/contact-detail.component';
import { AddContactDialogComponent } from './add-contact-dialog/add-contact-dialog.component';
import { EditContactDialogComponent } from './edit-contact-dialog/edit-contact-dialog.component';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog/confirm-delete-dialog.component';
import { ToastService } from '../shared/services/toast.service';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [
    ContactListComponent,
    ContactDetailComponent,
    AddContactDialogComponent,
    EditContactDialogComponent,
    ConfirmDeleteDialogComponent,
  ],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss', './contacts.responsive.scss'],
})
export class ContactsComponent implements OnInit, OnDestroy {
  contactsService = inject(ContactsService);
  private readonly navbarService = inject(NavbarService);
  private readonly toastService = inject(ToastService);

  readonly selectedContact = signal<Contact | null>(null);
  readonly isAddContactDialogOpen = signal(false);
  readonly isEditContactDialogOpen = signal(false);
  readonly isDeleteConfirmOpen = signal(false);
  readonly isDeleting = signal(false);
  readonly groups = computed(() => groupContactsByLetter(this.contactsService.contacts()));

  constructor() {
    // Keep the open detail in sync when Realtime (or local save) updates the list.
    effect(() => {
      const selected = this.selectedContact();
      if (!selected) {
        return;
      }

      const fresh = this.contactsService.contacts().find((contact) => contact.id === selected.id);
      if (!fresh) {
        this.selectedContact.set(null);
        this.isEditContactDialogOpen.set(false);
        this.isDeleteConfirmOpen.set(false);
        return;
      }

      if (fresh !== selected) {
        this.selectedContact.set(fresh);
      }
    });
  }

  ngOnInit(): void {
    this.navbarService.setSelection('contacts');
    void this.contactsService.loadContacts();
    this.contactsService.startRealtime();
  }

  ngOnDestroy(): void {
    this.contactsService.stopRealtime();
  }

  openEditContact(): void {
    this.isEditContactDialogOpen.set(true);
  }

  closeEditContact(): void {
    this.isEditContactDialogOpen.set(false);
  }

  onContactUpdated(contact: Contact): void {
    this.selectedContact.set(contact);
    this.closeEditContact();
  }

  /**
   * Opens the confirmation dialog (detail Delete button), nothing is deleted yet.
   */
  openDeleteConfirm(): void {
    this.isDeleteConfirmOpen.set(true);
  }

  closeDeleteConfirm(): void {
    this.isDeleteConfirmOpen.set(false);
  }

  /**
   * Deletes the selected contact after the user confirmed, then returns to the list.
   */
  async onDeleteContact(): Promise<void> {
    const contact = this.selectedContact();
    if (!contact || this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);
    try {
      const deleted = await this.contactsService.deleteContact(contact);
      if (deleted) {
        this.toastService.show('Contact successfully deleted');
        this.selectedContact.set(null);
        this.closeEditContact();
      } else {
        this.toastService.show(this.contactsService.errorMessage());
        this.contactsService.errorMessage.set('');
      }
    } finally {
      this.isDeleting.set(false);
      this.closeDeleteConfirm();
    }
  }
}
