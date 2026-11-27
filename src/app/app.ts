import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AuthenticationService } from './shared/services/authentication.service';

const PAGES_WITHOUT_SHELL = ['/', '/login', '/signUp'];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly router = inject(Router);
  private readonly authenticationService = inject(AuthenticationService);

  readonly showShell = signal(false);

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateShell(event.urlAfterRedirects);
      }
    });
  }

  /**
   * Restores the login state when the app starts.
   */
  async ngOnInit() {
    await this.authenticationService.checkLogin();
  }

  /**
   * Hides sidebar and header on login and sign up.
   * @param url - Url of the new page.
   */
  private updateShell(url: string): void {
    const path = url.split(/[?#]/)[0];
    this.showShell.set(!PAGES_WITHOUT_SHELL.includes(path));
  }
}
