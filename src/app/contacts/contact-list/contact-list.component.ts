import { Component, input, output } from '@angular/core';
import { Contact, ContactGroup } from '../../shared/models/contact.model';
import { getContactColor } from '../../shared/utils/contact.utils';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss', './contact-list.responsive.scss'],
})
export class ContactListComponent {
  groups = input.required<ContactGroup[]>();
  selectedId = input<string | null>(null);
  errorMessage = input('');

  selectContact = output<Contact>();
  addContact = output<void>();

  /**
   * Gets the avatar color of a contact.
   * @param contact - Contact in the list.
   * @returns CSS color value.
   */
  colorOf(contact: Contact): string {
    return getContactColor(contact.name_shortcut_color_code);
  }
}
