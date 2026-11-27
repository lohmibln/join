import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BackButtonComponent } from '../shared/components/back-button/back-button.component';

/** Explains what Join is and how the board works. */
@Component({
  selector: 'app-help',
  standalone: true,
  imports: [BackButtonComponent, RouterLink],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss',
})
export class HelpComponent {}
