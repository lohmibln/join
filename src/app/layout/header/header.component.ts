import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  authenticationService = inject(AuthenticationService);

  get initials(): string {
    const fullName = this.authenticationService.currentLoggedInUser?.user_metadata?.['full_name'];
    return fullName ? getInitials(fullName) : 'G';
  }
}
