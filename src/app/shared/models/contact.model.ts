export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  name_shortcut: string;
  name_shortcut_color_code: number;
  email: string;
  phone: string;
  img: string;
}

export type NewContact = Omit<Contact, 'id'>;

export interface ContactGroup {
  letter: string;
  contacts: Contact[];
}
