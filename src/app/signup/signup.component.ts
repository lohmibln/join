import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthenticationService } from '../shared/services/authentication.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent implements OnInit {
  authenticationService = inject(AuthenticationService);

  pwConfirmation = '';
  isPrivacyPolicyChecked = false;
  isPasswordVisible = false;
  isPasswordConfirmVisible = false;
  isPWDifferent = false;
  displayConfirmation = false;
  isSaving = false;

  newUser = {
    fullName: '',
    email: '',
    pw: '',
  };


  /**
   * Marks the page as signup view and clears old auth errors.
   */
  ngOnInit(): void {
    this.authenticationService.isLoginSignUpView = true;
    this.authenticationService.resetAuthError();
  }


  /**
   * Shows or hides the password field.
   */
  toggleIsPasswordVisible(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }


  /**
   * Shows or hides the password confirmation field.
   */
  toggleIsPasswordConfirmVisible(): void {
    this.isPasswordConfirmVisible = !this.isPasswordConfirmVisible;
  }


  /**
   * Validates the form, creates the user and shows the success message.
   * @param ngForm - The submitted signup form.
   */
  async onSubmit(ngForm: NgForm): Promise<void> {
    ngForm.control.markAllAsTouched();
    this.checkPwEquality();
    if (!ngForm.submitted || !ngForm.form.valid || this.newUser.pw !== this.pwConfirmation) {
      return;
    }
    await this.createUser();
    await this.confirmCreation();
  }


  /**
   * Sets isPWDifferent when password and confirmation do not match.
   */
  checkPwEquality(): void {
    this.isPWDifferent = this.newUser.pw !== this.pwConfirmation;
  }


  /**
   * Creates the account in Supabase with email, password and full name.
   */
  async createUser(): Promise<void> {
    this.isSaving = true;
    this.authenticationService.resetAuthError();
    try {
      await this.authenticationService.createUser(
        this.newUser.email,
        this.newUser.pw,
        this.newUser.fullName,
      );
    } finally {
      this.isSaving = false;
    }
  }


  /**
   * Shows the success toast, then logs out and opens the login page.
   */
  async confirmCreation(): Promise<void> {
    if (this.authenticationService.errorOccoursIn() != null) {
      return;
    }
    this.isPWDifferent = false;
    this.displayConfirmation = true;
    setTimeout(async () => {
      await this.authenticationService.logout();
    }, 1025);
  }
}
