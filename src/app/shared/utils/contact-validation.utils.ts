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
/** ASCII-only email (no ä ö ü or other special letters). */
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const PHONE_PATTERN = /^\+?\d+$/;
const UMLAUT_PATTERN = /[äöüÄÖÜß]/;

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
 * Validates the email address: required, valid format, no umlauts (ä ö ü).
 * @param value - Raw input value.
 * @returns Error message or empty string.
 */
export function validateEmail(value: string): string {
    const email = value.trim();
    if (!email) return 'Please enter an email address.';
    if (UMLAUT_PATTERN.test(email) || /[^\x00-\x7F]/.test(email)) {
        return 'Please use an email without special characters.';
    }
    if (!EMAIL_PATTERN.test(email)) return 'Please enter a valid email address.';
    return '';
}

/**
 * Removes an optional "+" and the German country code (+49 / 49 / 0049).
 * @param phone - Phone number made of digits and an optional "+".
 * @returns National digits only.
 */
function getNationalPhoneDigits(phone: string): string {
    const digits = phone.replace(/^\+/, '');
    if (digits.startsWith('0049')) return digits.slice(4);
    if (digits.startsWith('49')) return digits.slice(2);
    return digits;
}

/**
 * Validates the phone number: required, digits only, 8–11 digits excluding +49.
 * @param value - Raw input value.
 * @returns Error message or empty string.
 */
export function validatePhone(value: string): string {
    const phone = value.trim();
    if (!phone) return 'Please enter a phone number.';
    if (!PHONE_PATTERN.test(phone)) return 'Use digits only (optional "+").';

    const nationalDigits = getNationalPhoneDigits(phone);
    if (nationalDigits.length < 8 || nationalDigits.length > 11) {
        return 'Phone number must be 8–11 digits (excluding +49).';
    }
    return '';
}

/**
 * Validates a single contact field.
 * @param field - Which field to validate.
 * @param value - Raw input value.
 * @returns Error message or empty string.
 */
export function validateContactField(field: keyof ContactFormValues, value: string): string {
    switch (field) {
        case 'name':
            return validateName(value);
        case 'email':
            return validateEmail(value);
        case 'phone':
            return validatePhone(value);
    }
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