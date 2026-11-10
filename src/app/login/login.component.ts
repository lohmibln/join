import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../shared/services/authentication.service';
import { NavbarService } from '../shared/services/navbar.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', './login.responsive.scss'],
})
export class LoginComponent implements OnInit {
  router = inject(Router);
  authenticationService = inject(AuthenticationService);
  navbarService = inject(NavbarService);

  email = '';
  password = '';
  isPasswordVisible = false;
  readonly showAnimation = signal(false);

  constructor() {
    void this.checklogin();
    this.checkFirstVisit();
  }

  /**
   * Marks the page as login view and clears old errors.
   */
  ngOnInit(): void {
    this.authenticationService.isLoginSignUpView = true;
    this.authenticationService.resetAuthError();
  }

  /**
   * Opens the start page if someone is already logged in.
   */
  async checklogin() {
    await this.authenticationService.checkLogin();
    if (this.authenticationService.isUserLoggedIn) {
      await this.router.navigate(['/success']);
      this.navbarService.setSelection('success');
    }
  }

  /**
   * Plays the logo animation on the first visit only.
   */
  checkFirstVisit() {
    if (!this.authenticationService.isLoginAnnimationPlayedOnce) {
      this.showAnimation.set(true);
      setTimeout(() => {
        this.showAnimation.set(false);
        this.authenticationService.isLoginAnnimationPlayedOnce = true;
      }, 2000);
    }
  }

  /**
   * Starts the login with email and password.
   * @param email - Email of the user.
   * @param pw - Password of the user.
   */
  login(email: string, pw: string) {
    void this.authenticationService.login(email, pw);
  }

  /**
   * Logs in as guest.
   */
  async loginAsGuest() {
    this.authenticationService.resetAuthError();
    await this.authenticationService.loginAsGuest();
  }

  /**
   * Shows or hides the password.
   */
  toggleIsPasswordVisible() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  /**
   * Validates the form and starts the login.
   * @param ngForm - Submitted login form.
   */
  onSubmit(ngForm: NgForm) {
    ngForm.control.markAllAsTouched();
    if (ngForm.submitted && ngForm.form.valid) {
      this.authenticationService.resetAuthError();
      this.login(this.email, this.password);
    }
  }
}
