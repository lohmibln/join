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
      .on(
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
    this.upsertLocal(data as Contact);
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
    this.upsertLocal(updated);
    return updated;
  }

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
