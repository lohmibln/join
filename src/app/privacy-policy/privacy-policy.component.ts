import { Component } from '@angular/core';
import { BackButtonComponent } from '../shared/components/back-button/back-button.component';

/** Privacy policy of Join. Reachable with and without login. */
@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [BackButtonComponent],
  templateUrl: './privacy-policy.component.html',
})
export class PrivacyPolicyComponent {}
