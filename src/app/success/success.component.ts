import { Component } from '@angular/core';

/** Placeholder start page until the summary dashboard is built. */
@Component({
  selector: 'app-success',
  standalone: true,
  template: `<h1 class="success">Summary</h1>`,
  styles: [
    `
      .success {
        padding: 110px 96px;
      }
    `,
  ],
})
export class SuccessComponent {}
