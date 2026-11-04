import { Component, input } from '@angular/core';
import { Contact } from '../../shared/models/contact.model';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  templateUrl: './contact-detail.component.html',
  styleUrl: './contact-detail.component.scss',
})
export class ContactDetailComponent {
  contact = input.required<Contact>();
}
