import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@supabase/supabase-js';
import { buildNewContact } from '../utils/contact.utils';
import { supabase } from './supabase.client';

export type AuthErrorField =
  'fullname' | 'email' | 'pw' | 'pwConfirm' | 'email-pw' | 'global' | null;

type AuthErrorDetails = { message?: string; code?: string; status?: number };

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private readonly router = inject(Router);

  isLoginAnimationPlayedOnce = false;
  isUserLoggedIn = false;
  currentLoggedInUser: User | null = null;

  readonly errorMessageForFailedRequest = signal('');
  readonly errorField = signal<AuthErrorField>(null);

  /**
   * Creates a new user account.
   * @param email - Email of the new user.
   * @param password - Password of the new user.
   * @param fullName - Name shown in the app.
   * @returns True if the account was created.
   */
  async createUser(email: string, password: string, fullName = ''): Promise<boolean> {
    const options = { data: { full_name: fullName } };
    const { data, error } = await supabase.auth.signUp({ email, password, options });

    if (error) {
      this.setAuthError(error);
      return false;
    }

    if (data.user && !(await this.createContactForUser(data.user.id, fullName, email))) {
      return false;
    }

    this.resetAuthError();
    this.currentLoggedInUser = data.user;
    return true;
  }

  /**
   * Adds the new account to the contacts table (same id as the auth user).
   * @param userId - Auth user id used as contact id.
   * @param fullName - Display name from signup.
   * @param email - Email from signup.
   * @returns True if the contact was saved.
   */
  private async createContactForUser(
    userId: string,
    fullName: string,
    email: string,
  ): Promise<boolean> {
    const contact = { id: userId, ...buildNewContact(fullName, email, '') };
    const { error } = await supabase.from('contacts').insert(contact);

    if (error) {
      this.setAuthError(error);
      return false;
    }

    return true;
  }

  /**
   * Logs a user in and opens the start page.
   * @param email - Email of the user.
   * @param password - Password of the user.
   * @returns True if the login worked.
   */
  async login(email: string, password: string): Promise<boolean> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session || !data.user) {
      this.handleFailedLogin(error);
      return false;
    }

    await this.finishLogin(data.user);
    return true;
  }

  /**
   * Logs in as an anonymous Supabase user (same data access as registered users).
   * @returns True if the guest login worked.
   */
  async loginAsGuest(): Promise<boolean> {
    const { data, error } = await supabase.auth.signInAnonymously({
      options: { data: { full_name: 'Guest' } },
    });

    if (error || !data.session || !data.user) {
      this.setAuthError(error ?? { message: 'Guest login failed. Please try again later.' });
      return false;
    }

    await this.finishLogin(data.user);
    return true;
  }

  /**
   * Logs the current user or guest out and opens the login page.
   * Personal data stays inaccessible until the next login.
   */
  async logout() {
    await supabase.auth.signOut();
    this.isUserLoggedIn = false;
    this.currentLoggedInUser = null;
    this.resetAuthError();
    await this.router.navigate(['/']);
  }

  /**
   * Restores the login state after a page load.
   * @returns True if a Supabase session exists.
   */
  async checkLogin(): Promise<boolean> {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user ?? null;

    this.currentLoggedInUser = user;
    this.isUserLoggedIn = !!user;
    return this.isUserLoggedIn;
  }

  /**
   * Translates a Supabase auth error into a message for the form.
   * @param error - Error returned by Supabase.
   */
  setAuthError(error: AuthErrorDetails): void {
    const message = (error.message ?? '').toLowerCase();
    const code = (error.code ?? '').toLowerCase();

    if (this.isInvalidCredentials(error)) {
      this.showAuthError('email-pw', 'Check your email and password. Please try again.');
    } else if (code.includes('user_already_exists') || message.includes('already registered')) {
      this.showAuthError('email', 'Email is already in use');
    } else if (code.includes('weak_password') || message.includes('weak password')) {
      this.showAuthError('pw', 'Weak password. Use at least 6 characters');
    } else {
      this.showAuthError('global', error.message || 'Technical Error, please try again later');
    }
  }

  /**
   * Removes the current auth error.
   */
  resetAuthError() {
    this.errorField.set(null);
    this.errorMessageForFailedRequest.set('');
  }

  /**
   * Resets the login state and shows the error.
   * @param error - Error returned by Supabase, if any.
   */
  private handleFailedLogin(error: AuthErrorDetails | null): void {
    this.isUserLoggedIn = false;
    this.currentLoggedInUser = null;
    this.setAuthError(error ?? { code: 'invalid_credentials' });
  }

  /**
   * Stores the login state and opens the start page.
   * @param user - Logged in user (registered or anonymous guest).
   */
  private async finishLogin(user: User): Promise<void> {
    this.isUserLoggedIn = true;
    this.currentLoggedInUser = user;
    this.resetAuthError();
    await this.router.navigate(['/success']);
  }

  /**
   * Checks whether an error means wrong email or password.
   * @param error - Error returned by Supabase.
   * @returns True for wrong credentials.
   */
  private isInvalidCredentials(error: AuthErrorDetails): boolean {
    const message = (error.message ?? '').toLowerCase();
    return (
      (error.code ?? '').toLowerCase().includes('invalid_credentials') ||
      message.includes('invalid login credentials') ||
      message.includes('invalid email or password')
    );
  }

  /**
   * Shows an auth error at the given field.
   * @param field - Field the error belongs to.
   * @param message - Text of the error.
   */
  private showAuthError(field: AuthErrorField, message: string): void {
    this.errorField.set(field);
    this.errorMessageForFailedRequest.set(message);
  }
}
