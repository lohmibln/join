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

/**
 * Gets the avatar color for a color code.
 * @param colorCode - Color code stored with the contact.
 * @returns CSS color value.
 */
export function getContactColor(colorCode: number): string {
  return CONTACT_COLORS[(colorCode - 1) % CONTACT_COLORS.length] ?? CONTACT_COLORS[0];
}

/**
 * Builds the initials of a name.
 * @param fullName - Full name of the contact.
 * @returns Initials in upper case.
 */
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '';
  }
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : (parts[0][1] ?? '');
  return (first + last).toUpperCase();
}

/**
 * Splits a full name into first and last name.
 * @param fullName - Full name of the contact.
 * @returns First and last name.
 */
export function splitName(fullName: string): { firstName: string; lastName: string } {
  const [firstName, ...rest] = fullName.trim().split(/\s+/);
  return { firstName, lastName: rest.join(' ') };
}

/**
 * Builds a new contact from the form values.
 * @param name - Full name.
 * @param email - Email address.
 * @param phone - Phone number.
 * @returns Contact data with initials and a random color.
 */
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

/** Builds an updated contact and keeps the existing id and avatar color. */
export function buildUpdatedContact(
  existing: Contact,
  name: string,
  email: string,
  phone: string,
): Contact {
  const draft = buildNewContact(name, email, phone);
  return {
    ...draft,
    id: existing.id,
    name_shortcut_color_code: existing.name_shortcut_color_code,
    img: existing.img,
  };
}

/**
 * Sorts contacts by name and groups them by first letter.
 * @param contacts - Contacts to group.
 * @returns One group per first letter.
 */
export function groupContactsByLetter(contacts: Contact[]): ContactGroup[] {
  const sorted = [...contacts].sort((a, b) =>
    a.full_name.localeCompare(b.full_name, 'de', { sensitivity: 'base' }),
  );
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
