import { Injectable, signal } from '@angular/core';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Contact, NewContact } from '../models/contact.model';
import { supabase } from './supabase.client';

@Injectable({
  providedIn: 'root',
})
export class ContactsService {
  readonly contacts = signal<Contact[]>([]);
  readonly errorMessage = signal('');

  private realtimeChannel: RealtimeChannel | null = null;

  /**
   * Loads all contacts from Supabase into the list.
   */
  async loadContacts(): Promise<void> {
    const { data, error } = await supabase.from('contacts').select('*');

    if (error) {
      this.errorMessage.set('Contacts could not be loaded. Please try again later.');
      return;
    }

    this.errorMessage.set('');
    this.contacts.set((data ?? []) as Contact[]);
  }

  /**
   * Starts a live Supabase Realtime subscription for the contacts table
   * (same idea as Firebase onSnapshot in the reference project).
   */
  startRealtime(): void {
    if (this.realtimeChannel) {
      return;
    }

    this.realtimeChannel = supabase
      .channel('contacts-live')
      .on<Contact>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contacts' },
        (payload) => this.applyRealtimeChange(payload),
      )
      .subscribe();
  }

  /** Stops the live contacts subscription. */
  stopRealtime(): void {
    if (!this.realtimeChannel) {
      return;
    }

    void supabase.removeChannel(this.realtimeChannel);
    this.realtimeChannel = null;
  }

  /**
   * Saves a new contact and adds it to the list.
   * @param newContact - Contact data without id.
   * @returns The saved contact, or null if saving failed.
   */
  async addContact(newContact: NewContact): Promise<Contact | null> {
    const { data, error } = await supabase.from('contacts').insert(newContact).select().single();

    if (error || !data) {
      this.setWriteError(error?.code, 'Contact could not be saved. Please try again later.');
      return null;
    }

    this.errorMessage.set('');
    this.upsertLocal(data as Contact);
    return data as Contact;
  }

  /**
   * Saves the changes of a contact and updates the list.
   * @param contact - Contact with its new values.
   * @returns The saved contact, or null if saving failed.
   */
  async updateContact(contact: Contact): Promise<Contact | null> {
    const { id, ...fields } = contact;
    const query = supabase.from('contacts').update(fields).eq('id', id);
    const { data, error } = await query.select().single();

    if (error || !data) {
      this.setWriteError(error?.code, 'Contact could not be updated. Please try again later.');
      return null;
    }

    this.errorMessage.set('');
    this.upsertLocal(data as Contact);
    return data as Contact;
  }

  /**
   * Deletes a contact and removes it from the list.
   * @param contact - Contact to delete.
   * @returns True if the contact was deleted.
   */
  async deleteContact(contact: Contact): Promise<boolean> {
    const { error } = await supabase.from('contacts').delete().eq('id', contact.id);

    if (error) {
      this.errorMessage.set('Contact could not be deleted. Please try again later.');
      return false;
    }

    this.errorMessage.set('');
    this.contacts.update((contacts) => contacts.filter((entry) => entry.id !== contact.id));
    return true;
  }

  /**
   * Applies a live change from Supabase to the list.
   * @param payload - Change sent by Supabase Realtime.
   */
  private applyRealtimeChange(payload: RealtimePostgresChangesPayload<Contact>): void {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      this.upsertLocal(payload.new as Contact);
      return;
    }

    if (payload.eventType === 'DELETE') {
      const removed = payload.old as Partial<Contact>;
      if (!removed.id) {
        return;
      }
      this.contacts.update((contacts) => contacts.filter((entry) => entry.id !== removed.id));
    }
  }

  /**
   * Sets the message for a failed insert or update.
   * @param code - Database error code.
   * @param fallback - Message for all other errors.
   */
  private setWriteError(code: string | undefined, fallback: string): void {
    this.errorMessage.set(code === '23505' ? 'A contact with this email already exists.' : fallback);
  }

  /**
   * Adds a contact to the list or replaces its old version.
   * @param contact - Contact to store.
   */
  private upsertLocal(contact: Contact): void {
    this.contacts.update((contacts) => {
      const index = contacts.findIndex((entry) => entry.id === contact.id);
      if (index === -1) {
        return [...contacts, contact];
      }
      const next = [...contacts];
      next[index] = contact;
      return next;
    });
  }
}
