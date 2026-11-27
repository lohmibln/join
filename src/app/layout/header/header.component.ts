import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { getInitials } from '../../shared/utils/contact.utils';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss', './header.responsive.scss'],
})
export class HeaderComponent {
  readonly authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);
  readonly menuOpen = signal(false);

  /**
   * Checks whether the help page is open, where the help button is hidden.
   * @returns True on the help page.
   */
  get isHelpPage(): boolean {
    return this.router.url.startsWith('/help');
  }

  /**
   * Gets the initials for the user badge.
   * @returns Initials of the user, or G for a guest.
   */
  get initials(): string {
    const fullName = this.authenticationService.currentLoggedInUser?.user_metadata?.['full_name'];
    return fullName ? getInitials(fullName) : 'G';
  }

  /** Opens or closes the user menu. */
  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen.update((open) => !open);
  }

  /** Closes the user menu. */
  closeMenu(): void {
    this.menuOpen.set(false);
  }

  /** Logs out and closes the menu. */
  logout(): void {
    this.closeMenu();
    void this.authenticationService.logout();
  }
}
