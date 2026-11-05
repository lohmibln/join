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
const PHONE_INPUT_PATTERN = /^\+?[\d\s()-]+$/;
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
        return 'Please use an email without special characters (ä, ö, ü).';
    }
    if (!EMAIL_PATTERN.test(email)) return 'Please enter a valid email address.';
    return '';
}

/**
 * Strips formatting and an optional German country code (+49 / 49 / 0049).
 * @param phone - Raw phone input.
 * @returns National digits only, or null if the input is not a phone-like value.
 */
function getNationalPhoneDigits(phone: string): string | null {
    const cleaned = phone.trim().replace(/[\s()-]/g, '');
    if (!/^\+?\d+$/.test(cleaned)) {
        return null;
    }

    let digits = cleaned.replace(/^\+/, '');
    if (digits.startsWith('0049')) {
        digits = digits.slice(4);
    } else if (digits.startsWith('49')) {
        digits = digits.slice(2);
    }

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
    if (!PHONE_INPUT_PATTERN.test(phone)) {
        return 'Use digits only (optional "+" and spaces).';
    }

    const nationalDigits = getNationalPhoneDigits(phone);
    if (nationalDigits === null) {
        return 'Use digits only (optional "+" and spaces).';
    }
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