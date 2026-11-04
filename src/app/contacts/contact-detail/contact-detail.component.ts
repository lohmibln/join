import { Component, computed, input, output } from '@angular/core';
import { Contact } from '../../shared/models/contact.model';
import { getContactColor } from '../../shared/utils/contact.utils';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  templateUrl: './contact-detail.component.html',
  styleUrl: './contact-detail.component.scss',
})
export class ContactDetailComponent {
  contact = input.required<Contact>();

  editContact = output<void>();
  deleteContact = output<void>();

  readonly color = computed(() => getContactColor(this.contact().name_shortcut_color_code));
}
