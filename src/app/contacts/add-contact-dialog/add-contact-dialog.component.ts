import { afterNextRender, Component, ElementRef, inject, output, signal, viewChild } from '@angular/core';
import { Contact } from '../../shared/models/contact.model';
import { ContactsService } from '../../shared/services/contacts.service';
import {
  ContactFormErrors,
  ContactFormValues,
  hasErrors,
  validateContactForm,
} from '../../shared/utils/contact-validation.utils';

const EMPTY_ERRORS: ContactFormErrors = { name: '', email: '', phone: '' };
const DUPLICATE_EMAIL_MESSAGE = 'This email address already exists.';

@Component({
  selector: 'app-add-contact-dialog',
  standalone: true,
  templateUrl: './add-contact-dialog.component.html',
  styleUrl: './add-contact-dialog.component.scss',
  host: { '(document:keydown.escape)': 'close()' },
})
export class AddContactDialogComponent {
  private readonly contactsService = inject(ContactsService);
  private readonly nameInput = viewChild.required<ElementRef<HTMLInputElement>>('nameInput');

  readonly closed = output<void>();
  readonly created = output<Contact>();

  readonly values = signal<ContactFormValues>({ name: '', email: '', phone: '' });
  readonly errors = signal<ContactFormErrors>(EMPTY_ERRORS);
  readonly formError = signal('');
  readonly isSaving = signal(false);

  constructor() {
    afterNextRender(() => this.nameInput().nativeElement.focus());
  }

  /**
 * Stores the typed value and removes the error of that field.
 * @param field - Field that was changed.
 * @param event - Input event of the field.
 */
  onInput(field: keyof ContactFormValues, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.values.update((values) => ({ ...values, [field]: value }));
    this.errors.update((errors) => ({ ...errors, [field]: '' }));
    this.formError.set('');
  }

  /**
 * Validates the form and saves the contact if everything is valid.
 * @param event - Submit event of the form.
 */
  async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.isSaving()) return;
    const errors = this.collectErrors();
    this.errors.set(errors);
    if (hasErrors(errors)) return;
  }

  /**
   * Closes the dialog.
   */
  close(): void {
    this.closed.emit();
  }

  /**
   * Closes the dialog when the dark background (not the dialog itself) is clicked.
   * @param event - Click event of the overlay.
   */
  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }

  private collectErrors(): ContactFormErrors {
    const errors = validateContactForm(this.values());
    if (!errors.email && this.isDuplicateEmail(this.values().email)) {
      errors.email = DUPLICATE_EMAIL_MESSAGE;
    }
    return errors;
  }

  private isDuplicateEmail(email: string): boolean {
    const wanted = email.trim().toLowerCase();
    return this.contactsService.contacts().some((contact) => contact.email.toLowerCase() === wanted);
  }
}