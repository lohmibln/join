import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Contact } from '../shared/models/contact.model';
import { ContactsService } from '../shared/services/contacts.service';
import { NavbarService } from '../shared/services/navbar.service';
import { groupContactsByLetter } from '../shared/utils/contact.utils';
import { ContactListComponent } from './contact-list/contact-list.component';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [ContactListComponent],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss', './contacts.responsive.scss'],
})
export class ContactsComponent implements OnInit {
  contactsService = inject(ContactsService);
  private readonly navbarService = inject(NavbarService);

  readonly selectedContact = signal<Contact | null>(null);
  readonly groups = computed(() => groupContactsByLetter(this.contactsService.contacts()));

  ngOnInit(): void {
    this.navbarService.setSelection('contacts');
    void this.contactsService.loadContacts();
  }
}
