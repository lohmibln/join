import { Injectable, signal } from '@angular/core';
import { Contact, NewContact } from '../models/contact.model';
import { supabase } from './supabase.client';

@Injectable({
  providedIn: 'root',
})
export class ContactsService {
  readonly contacts = signal<Contact[]>([]);
  readonly errorMessage = signal('');

  async loadContacts(): Promise<void> {
    const { data, error } = await supabase.from('contacts').select('*');

    if (error) {
      this.errorMessage.set('Contacts could not be loaded. Please try again later.');
      return;
    }

    this.errorMessage.set('');
    this.contacts.set((data ?? []) as Contact[]);
  }

  async addContact(newContact: NewContact): Promise<Contact | null> {
    const { data, error } = await supabase.from('contacts').insert(newContact).select().single();

    if (error || !data) {
      this.errorMessage.set(
        error?.code === '23505'
          ? 'A contact with this email already exists.'
          : 'Contact could not be saved. Please try again later.',
      );
      return null;
    }

    this.errorMessage.set('');
    this.contacts.update((contacts) => [...contacts, data as Contact]);
    return data as Contact;
  }

  async updateContact(contact: Contact): Promise<Contact | null> {
    const { id, ...fields } = contact;
    const { data, error } = await supabase
      .from('contacts')
      .update(fields)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      this.errorMessage.set(
        error?.code === '23505'
          ? 'A contact with this email already exists.'
          : 'Contact could not be updated. Please try again later.',
      );
      return null;
    }

    const updated = data as Contact;
    this.errorMessage.set('');
    this.contacts.update((contacts) =>
      contacts.map((entry) => (entry.id === updated.id ? updated : entry)),
    );
    return updated;
  }
}
