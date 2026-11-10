import { afterNextRender, Component, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { Contact } from '../../shared/models/contact.model';
import { ContactsService } from '../../shared/services/contacts.service';
import { ToastService } from '../../shared/services/toast.service';
import { buildUpdatedContact, getContactColor } from '../../shared/utils/contact.utils';
import {
  ContactFormErrors,
  ContactFormValues,
  hasErrors,
  validateContactField,
  validateContactForm,
} from '../../shared/utils/contact-validation.utils';

const EMPTY_ERRORS: ContactFormErrors = { name: '', email: '', phone: '' };
const DUPLICATE_EMAIL_MESSAGE = 'This email address already exists.';
const SUCCESS_MESSAGE = 'Contact successfully updated';

@Component({
  selector: 'app-edit-contact-dialog',
  standalone: true,
  templateUrl: './edit-contact-dialog.component.html',
  styleUrls: [
    '../add-contact-dialog/add-contact-dialog.component.scss',
    './edit-contact-dialog.component.scss',
  ],
  host: { '(document:keydown.escape)': 'close()' },
})
export class EditContactDialogComponent {
  private readonly contactsService = inject(ContactsService);
  private readonly toastService = inject(ToastService);
  private readonly nameInput = viewChild.required<ElementRef<HTMLInputElement>>('nameInput');

  readonly contact = input.required<Contact>();

  readonly closed = output<void>();
  readonly updated = output<Contact>();
  readonly deleteRequested = output<void>();

  readonly values = signal<ContactFormValues>({ name: '', email: '', phone: '' });
  readonly errors = signal<ContactFormErrors>(EMPTY_ERRORS);
  readonly formError = signal('');
  readonly isSaving = signal(false);

  constructor() {
    afterNextRender(() => {
      const contact = this.contact();
      this.values.set({
        name: contact.full_name,
        email: contact.email,
        phone: contact.phone,
      });
      // preventScroll: focusing while the dialog is still off-screen must not scroll the page.
      this.nameInput().nativeElement.focus({ preventScroll: true });
    });
  }

  avatarColor(): string {
    return getContactColor(this.contact().name_shortcut_color_code);
  }

  avatarShortcut(): string {
    return this.contact().name_shortcut;
  }

  /**
   * Stores the typed value and clears that field's error.
   */
  onInput(field: keyof ContactFormValues, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.values.update((values) => ({ ...values, [field]: value }));
    this.errors.update((errors) => ({ ...errors, [field]: '' }));
    this.formError.set('');
  }

  /**
   * Hides the error while the user is editing the field again.
   */
  onFocus(field: keyof ContactFormValues): void {
    this.errors.update((errors) => ({ ...errors, [field]: '' }));
    this.formError.set('');
  }

  /**
   * Validates only the field the user left (blur).
   */
  onBlur(field: keyof ContactFormValues): void {
    let message = validateContactField(field, this.values()[field]);
    if (field === 'email' && !message && this.isDuplicateEmail(this.values().email)) {
      message = DUPLICATE_EMAIL_MESSAGE;
    }
    this.errors.update((errors) => ({ ...errors, [field]: message }));
  }

  /**
   * Validates and saves the contact via Supabase when the form is valid.
   */
  async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.isSaving()) return;

    const errors = this.collectErrors();
    this.errors.set(errors);
    if (hasErrors(errors)) return;

    await this.save();
  }

  close(): void {
    this.closed.emit();
  }

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
    const currentId = this.contact().id;
    return this.contactsService
      .contacts()
      .some((entry) => entry.id !== currentId && entry.email.toLowerCase() === wanted);
  }

  private async save(): Promise<void> {
    this.isSaving.set(true);
    try {
      const { name, email, phone } = this.values();
      const payload = buildUpdatedContact(this.contact(), name, email.toLowerCase(), phone);
      const contact = await this.contactsService.updateContact(payload);
      if (contact) this.finish(contact);
      else this.showSaveError();
    } finally {
      this.isSaving.set(false);
    }
  }

  private finish(contact: Contact): void {
    this.toastService.show(SUCCESS_MESSAGE);
    this.updated.emit(contact);
    this.close();
  }

  private showSaveError(): void {
    this.formError.set(this.contactsService.errorMessage());
    this.contactsService.errorMessage.set('');
  }
}
