/**
 * Validation helpers for the contact forms (Add contact / Edit contact).
 * Every validator returns an error message, or an empty string if the value is valid.
 * No HTML5 validation is used; the messages are shown under the input fields.
 */

export interface ContactFormValues {
    name: string;
    email: string;
    phone: string;
}

export type ContactFormErrors = Record<keyof ContactFormValues, string>;

const NAME_PATTERN = /^\p{L}+(?:['’-]\p{L}+)*(?:\s+\p{L}+(?:['’-]\p{L}+)*)+$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?\d+$/;

/**
 * Validates the full name: required, no digits, first and last name.
 * @param value - Raw input value.
 * @returns Error message or empty string.
 */
export function validateName(value: string): string {
    const name = value.trim();
    if (!name) return 'Please enter a name.';
    if (/\d/.test(name)) return 'The name must not contain numbers.';
    if (!NAME_PATTERN.test(name)) return 'Please enter first and last name.';
    return '';
}

/**
 * Validates the email address: required and matching the email pattern.
 * @param value - Raw input value.
 * @returns Error message or empty string.
 */
export function validateEmail(value: string): string {
    const email = value.trim();
    if (!email) return 'Please enter an email address.';
    if (!EMAIL_PATTERN.test(email)) return 'Please enter a valid email address.';
    return '';
}

/**
 * Validates the phone number: required, digits only, optional leading "+".
 * @param value - Raw input value.
 * @returns Error message or empty string.
 */
export function validatePhone(value: string): string {
    const phone = value.trim();
    if (!phone) return 'Please enter a phone number.';
    if (!PHONE_PATTERN.test(phone)) return 'Use digits only (optional "+" at the start).';
    return '';
}

/**
 * Validates all contact fields at once.
 * @param values - Current form values.
 * @returns Error message per field.
 */
export function validateContactForm(values: ContactFormValues): ContactFormErrors {
    return {
        name: validateName(values.name),
        email: validateEmail(values.email),
        phone: validatePhone(values.phone),
    };
}

/**
 * Checks whether a validation result contains at least one error.
 * @param errors - Result of validateContactForm.
 * @returns True if any field has an error.
 */
export function hasErrors(errors: ContactFormErrors): boolean {
    return Object.values(errors).some((message) => message !== '');
}