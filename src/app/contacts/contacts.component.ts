import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Contact } from '../shared/models/contact.model';
import { ContactsService } from '../shared/services/contacts.service';
import { NavbarService } from '../shared/services/navbar.service';
import { groupContactsByLetter } from '../shared/utils/contact.utils';
import { ContactListComponent } from './contact-list/contact-list.component';
import { ContactDetailComponent } from './contact-detail/contact-detail.component';
import { AddContactDialogComponent } from './add-contact-dialog/add-contact-dialog.component';
import { EditContactDialogComponent } from './edit-contact-dialog/edit-contact-dialog.component';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [
    ContactListComponent,
    ContactDetailComponent,
    AddContactDialogComponent,
    EditContactDialogComponent,
  ],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss', './contacts.responsive.scss'],
})
export class ContactsComponent implements OnInit, OnDestroy {
  contactsService = inject(ContactsService);
  private readonly navbarService = inject(NavbarService);

  readonly selectedContact = signal<Contact | null>(null);
  readonly isAddContactDialogOpen = signal(false);
  readonly isEditContactDialogOpen = signal(false);
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
}
