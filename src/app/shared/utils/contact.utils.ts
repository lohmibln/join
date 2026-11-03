import { Contact, ContactGroup, NewContact } from '../models/contact.model';

export const CONTACT_COLORS = [
  '#FF7A00',
  '#FF5EB3',
  '#6E52FF',
  '#9327FF',
  '#00BEE8',
  '#1FD7C1',
  '#FF745E',
  '#FFA35E',
  '#FC71FF',
  '#FFC701',
  '#0038FF',
  '#C3FF2B',
  '#FFE62B',
  '#FF4646',
  '#FFBB2B',
];

export function getContactColor(colorCode: number): string {
  return CONTACT_COLORS[(colorCode - 1) % CONTACT_COLORS.length] ?? CONTACT_COLORS[0];
}

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '';
  }
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : (parts[0][1] ?? '');
  return (first + last).toUpperCase();
}

export function splitName(fullName: string): { firstName: string; lastName: string } {
  const [firstName, ...rest] = fullName.trim().split(/\s+/);
  return { firstName, lastName: rest.join(' ') };
}

export function buildNewContact(name: string, email: string, phone: string): NewContact {
  const fullName = name.trim().replace(/\s+/g, ' ');
  const { firstName, lastName } = splitName(fullName);
  return {
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
    name_shortcut: getInitials(fullName),
    name_shortcut_color_code: Math.floor(Math.random() * CONTACT_COLORS.length) + 1,
    email: email.trim(),
    phone: phone.trim(),
    img: '',
  };
}

export function groupContactsByLetter(contacts: Contact[]): ContactGroup[] {
  const sorted = [...contacts].sort();
  const groups: ContactGroup[] = [];
  for (const contact of sorted) {
    const letter = contact.full_name.charAt(0).toUpperCase();
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.letter === letter) {
      lastGroup.contacts.push(contact);
    } else {
      groups.push({ letter, contacts: [contact] });
    }
  }
  return groups;
}
