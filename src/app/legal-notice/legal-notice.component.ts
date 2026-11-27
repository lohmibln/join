import { Component } from '@angular/core';
import { BackButtonComponent } from '../shared/components/back-button/back-button.component';

/** Provider details for the imprint. Fill in the real data before the submission. */
const IMPRINT = {
  names: ['Lucas [Nachname]', 'Berk [Nachname]', 'Tayfun Danabas', 'Hien [Nachname]'],
  street: '[Straße Hausnummer]',
  city: '[PLZ Ort]',
  email: '[team-email@example.com]',
};

/** Imprint and terms of use of Join. Reachable with and without login. */
@Component({
  selector: 'app-legal-notice',
  standalone: true,
  imports: [BackButtonComponent],
  templateUrl: './legal-notice.component.html',
})
export class LegalNoticeComponent {
  readonly imprint = IMPRINT;
}
