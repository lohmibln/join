import { Component, inject, OnInit } from '@angular/core';
import { AuthenticationService } from '../shared/services/authentication.service';

@Component({
  selector: 'app-success',
  standalone: true,
  template: `
    <section class="success">
      <h1>Success</h1>
      <button type="button" (click)="logout()">Log out</button>
    </section>
  `,
  styles: [
    `
      .success {
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
      }

      button {
        color: white;
        background-color: #2a3647;
        border: unset;
        border-radius: 10px;
        height: 48px;
        width: 110px;
        font-weight: 700;
        cursor: pointer;
      }

      button:hover {
        background-color: #29abe2;
      }
    `,
  ],
})
export class SuccessComponent implements OnInit {
  private readonly authenticationService = inject(AuthenticationService);

  ngOnInit(): void {
    this.authenticationService.isLoginSignUpView = false;
  }

  logout() {
    this.authenticationService.logout();
  }
}
