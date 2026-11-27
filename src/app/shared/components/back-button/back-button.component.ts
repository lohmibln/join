import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';

/** Arrow button that returns to the page the user visited before. */
@Component({
  selector: 'app-back-button',
  standalone: true,
  template: `
    <button class="backButton" type="button" aria-label="Back" (click)="goBack()">
      <img class="default" src="assets/icons/arrow-left.svg" alt="" />
      <img class="hover" src="assets/icons/arrow-left-hover.svg" alt="" />
    </button>
  `,
  styles: [
    `
      .backButton {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        padding: 0;
        border: unset;
        border-radius: 50%;
        background: transparent;
      }

      .hover,
      .backButton:hover .default {
        display: none;
      }

      .backButton:hover .hover {
        display: block;
      }
    `,
  ],
})
export class BackButtonComponent {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly authenticationService = inject(AuthenticationService);

  /**
   * Goes back in the history. Opens the start page when the app was opened on this page.
   */
  goBack(): void {
    if (this.router.lastSuccessfulNavigation()?.previousNavigation) {
      this.location.back();
      return;
    }
    const startPage = this.authenticationService.isUserLoggedIn ? '/success' : '/';
    void this.router.navigateByUrl(startPage);
  }
}
