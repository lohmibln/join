import { Component, computed, input, output, signal } from '@angular/core';
import { Contact } from '../../shared/models/contact.model';
import { getContactColor } from '../../shared/utils/contact.utils';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  templateUrl: './contact-detail.component.html',
  styleUrls: ['./contact-detail.component.scss', './contact-detail.responsive.scss'],
  host: { '(document:click)': 'closeMenu()' },
})
export class ContactDetailComponent {
  contact = input.required<Contact>();

  editContact = output<void>();
  deleteContact = output<void>();

  readonly isMenuOpen = signal(false);
  readonly color = computed(() => getContactColor(this.contact().name_shortcut_color_code));

  /**
   * Opens or closes the mobile options menu.
   * @param event - Click event of the menu button, stopped so the document click does not close it again.
   */
  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isMenuOpen.update((isOpen) => !isOpen);
  }

  /**
   * Closes the mobile options menu.
   */
  closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
