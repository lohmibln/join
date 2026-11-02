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

  async createUser(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName ?? '',
        },
      },
    });

    if (error) {
      this.setAuthError(error);
      return false;
    }

    this.resetAuthError();
    this.currentLoggedInUser = data.user;
    return true;
  }

  async login(email: string, password: string): Promise<boolean> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session || !data.user) {
      this.isUserLoggedIn = false;
      this.currentLoggedInUser = null;
      this.setAuthError(
        error ?? {
          message: 'Invalid login credentials',
          status: 400,
          code: 'invalid_credentials',
        },
      );
      return false;
    }

    this.isUserLoggedIn = true;
    this.currentLoggedInUser = data.user;
    this.isLoginSignUpView = false;
    this.resetAuthError();
    this.navbarService.setSelection('success');
    await this.router.navigate(['/success']);
    return true;
  }

  /** Guest bypass — no Supabase auth required. */
  async loginAsGuest(): Promise<void> {
    this.isUserLoggedIn = true;
    this.currentLoggedInUser = null;
    this.isLoginSignUpView = false;
    this.resetAuthError();
    this.navbarService.setSelection('success');
    await this.router.navigate(['/success']);
  }

  async logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      this.setAuthError(error);
      return;
    }

    this.isUserLoggedIn = false;
    this.currentLoggedInUser = null;
    this.isLoginSignUpView = true;
    this.resetAuthError();
    await this.router.navigate(['/']);
  }

  async checkLogin(): Promise<boolean> {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user ?? null;

    this.currentLoggedInUser = user;
    this.isUserLoggedIn = !!user;
    return this.isUserLoggedIn;
  }

  setAuthError(error: { message?: string; code?: string; status?: number }) {
    const message = (error.message ?? '').toLowerCase();
    const code = (error.code ?? '').toLowerCase();

    if (
      code.includes('invalid_credentials') ||
      message.includes('invalid login credentials') ||
      message.includes('invalid email or password') ||
      error.status === 400
    ) {
      this.errorOccoursIn.set('email-pw');
      this.errorMessageForFailedRequest.set(
        'Check your email and password. Please try again.',
      );
      return;
    }

    if (
      code.includes('user_already_exists') ||
      message.includes('already registered')
    ) {
      this.errorOccoursIn.set('email');
      this.errorMessageForFailedRequest.set('Email is already in use');
      return;
    }

    if (code.includes('weak_password') || message.includes('weak password')) {
      this.errorOccoursIn.set('pw');
      this.errorMessageForFailedRequest.set(
        'Weak password. Use at least 6 characters',
      );
      return;
    }

    this.errorOccoursIn.set('global');
    this.errorMessageForFailedRequest.set(
      error.message || 'Technical Error, please try again later',
    );
  }

  resetAuthError() {
    this.errorOccoursIn.set(null);
    this.errorMessageForFailedRequest.set('');
  }

  /** Kept for templates copied from the original project. */
  resetFirebaseError() {
    this.resetAuthError();
  }
}
