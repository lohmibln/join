import { afterNextRender, Component, ElementRef, inject, output, signal, viewChild } from '@angular/core';
import { Contact, NewContact } from '../../shared/models/contact.model';
import { ContactsService } from '../../shared/services/contacts.service';
import { ToastService } from '../../shared/services/toast.service';
import { buildNewContact } from '../../shared/utils/contact.utils';
import {
  ContactFormErrors,
  ContactFormValues,
  hasErrors,
  validateContactField,
  validateContactForm,
} from '../../shared/utils/contact-validation.utils';

const EMPTY_ERRORS: ContactFormErrors = { name: '', email: '', phone: '' };
const DUPLICATE_EMAIL_MESSAGE = 'This email address already exists.';
const SUCCESS_MESSAGE = 'Contact successfully created';

@Component({
  selector: 'app-add-contact-dialog',
  standalone: true,
  templateUrl: './add-contact-dialog.component.html',
  styleUrls: ['./add-contact-dialog.component.scss', './add-contact-dialog.responsive.scss'],
  host: { '(document:keydown.escape)': 'close()' },
})
export class AddContactDialogComponent {
  private readonly contactsService = inject(ContactsService);
  private readonly toastService = inject(ToastService);
  private readonly nameInput = viewChild.required<ElementRef<HTMLInputElement>>('nameInput');

  readonly closed = output<void>();
  readonly created = output<Contact>();

  readonly values = signal<ContactFormValues>({ name: '', email: '', phone: '' });
  readonly errors = signal<ContactFormErrors>(EMPTY_ERRORS);
  readonly formError = signal('');
  readonly isSaving = signal(false);

  constructor() {
    // preventScroll: focusing while the dialog is still off-screen must not scroll the page.
    afterNextRender(() => this.nameInput().nativeElement.focus({ preventScroll: true }));
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
   * Hides the error while the user is editing the field again.
   * @param field - Field that received focus.
   */
  onFocus(field: keyof ContactFormValues): void {
    this.errors.update((errors) => ({ ...errors, [field]: '' }));
    this.formError.set('');
  }

  /**
   * Validates only the field the user left (blur).
   * @param field - Field that lost focus.
   */
  onBlur(field: keyof ContactFormValues): void {
    let message = validateContactField(field, this.values()[field]);
    if (field === 'email' && !message && this.isDuplicateEmail(this.values().email)) {
      message = DUPLICATE_EMAIL_MESSAGE;
    }
    this.errors.update((errors) => ({ ...errors, [field]: message }));
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
    await this.save();
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

  /**
   * Validates the whole form including the duplicate email check.
   * @returns Error message per field.
   */
  private collectErrors(): ContactFormErrors {
    const errors = validateContactForm(this.values());
    if (!errors.email && this.isDuplicateEmail(this.values().email)) {
      errors.email = DUPLICATE_EMAIL_MESSAGE;
    }
    return errors;
  }

  /**
   * Checks whether another contact already uses this email.
   * @param email - Email to look for.
   * @returns True if the email is already taken.
   */
  private isDuplicateEmail(email: string): boolean {
    const wanted = email.trim().toLowerCase();
    return this.contactsService.contacts().some((contact) => contact.email.toLowerCase() === wanted);
  }

  /**
   * Builds the new contact from the form values.
   * @returns Contact data for Supabase.
   */
  private buildContact(): NewContact {
    const { name, email, phone } = this.values();
    return buildNewContact(name, email.toLowerCase(), phone);
  }

  /**
   * Saves the contact and blocks the form while the request is running.
   */
  private async save(): Promise<void> {
    this.isSaving.set(true);
    try {
      const contact = await this.contactsService.addContact(this.buildContact());
      if (contact) this.finish(contact);
      else this.showSaveError();
    } finally {
      this.isSaving.set(false);
    }
  }

  /**
   * Shows the success toast and closes the dialog.
   * @param contact - Contact that was created.
   */
  private finish(contact: Contact): void {
    this.toastService.show(SUCCESS_MESSAGE);
    this.created.emit(contact);
    this.close();
  }

  /**
   * Moves the service error into the form.
   */
  private showSaveError(): void {
    this.formError.set(this.contactsService.errorMessage());
    this.contactsService.errorMessage.set('');
  }
}