import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@supabase/supabase-js';
import { NavbarService } from './navbar.service';
import { supabase } from './supabase.client';

export type AuthErrorField =
  | 'fullname'
  | 'email'
  | 'pw'
  | 'pwConfirm'
  | 'email-pw'
  | 'global'
  | null;

type AuthErrorDetails = { message?: string; code?: string; status?: number };

const GUEST_STORAGE_KEY = 'joinGuestLogin';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private readonly router = inject(Router);
  private readonly navbarService = inject(NavbarService);

  isLoginSignUpView = true;
  isLoginAnnimationPlayedOnce = false;
  isUserLoggedIn = false;
  currentLoggedInUser: User | null = null;

  GUESTUSER = {
    email: 'guest@user.de',
    pw: '123456',
  };

  readonly errorMessageForFailedRequest = signal('');
  readonly errorOccoursIn = signal<AuthErrorField>(null);

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

    this.resetAuthError();
    this.currentLoggedInUser = data.user;
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

    localStorage.removeItem(GUEST_STORAGE_KEY);
    await this.finishLogin(data.user);
    return true;
  }

  /** Guest bypass — no Supabase auth required. */
  async loginAsGuest(): Promise<void> {
    localStorage.setItem(GUEST_STORAGE_KEY, 'true');
    await this.finishLogin(null);
  }

  /**
   * Logs the current user or guest out and opens the login page.
   */
  async logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      this.setAuthError(error);
      return;
    }

    localStorage.removeItem(GUEST_STORAGE_KEY);
    this.isUserLoggedIn = false;
    this.currentLoggedInUser = null;
    this.isLoginSignUpView = true;
    this.resetAuthError();
    await this.router.navigate(['/']);
  }

  /**
   * Restores the login state after a page load.
   * @returns True if a user or guest is logged in.
   */
  async checkLogin(): Promise<boolean> {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user ?? null;

    this.currentLoggedInUser = user;
    this.isUserLoggedIn = !!user || localStorage.getItem(GUEST_STORAGE_KEY) === 'true';
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
    this.errorOccoursIn.set(null);
    this.errorMessageForFailedRequest.set('');
  }

  /** Kept for templates copied from the original project. */
  resetFirebaseError() {
    this.resetAuthError();
  }

  /**
   * Resets the login state and shows the error.
   * @param error - Error returned by Supabase, if any.
   */
  private handleFailedLogin(error: AuthErrorDetails | null): void {
    this.isUserLoggedIn = false;
    this.currentLoggedInUser = null;
    this.setAuthError(error ?? { message: 'Invalid login credentials', status: 400 });
  }

  /**
   * Stores the login state and opens the start page.
   * @param user - Logged in user, or null for a guest.
   */
  private async finishLogin(user: User | null): Promise<void> {
    this.isUserLoggedIn = true;
    this.currentLoggedInUser = user;
    this.isLoginSignUpView = false;
    this.resetAuthError();
    this.navbarService.setSelection('success');
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
      message.includes('invalid email or password') ||
      error.status === 400
    );
  }

  /**
   * Shows an auth error at the given field.
   * @param field - Field the error belongs to.
   * @param message - Text of the error.
   */
  private showAuthError(field: AuthErrorField, message: string): void {
    this.errorOccoursIn.set(field);
    this.errorMessageForFailedRequest.set(message);
  }
}
