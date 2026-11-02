import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthenticationService } from '../shared/services/authentication.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="placeholder">
      <h1>Sign up</h1>
      <p>Sign-up form will be added next.</p>
      <a routerLink="/">Back to login</a>
    </section>
  `,
  styles: [
    `
      .placeholder {
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
      }
    `,
  ],
})
export class SignupComponent implements OnInit {
  private readonly authenticationService = inject(AuthenticationService);

  ngOnInit(): void {
    this.authenticationService.isLoginSignUpView = true;
  }
}
