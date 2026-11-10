import { Component, inject, OnInit } from '@angular/core';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AuthenticationService } from './shared/services/authentication.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly router = inject(Router);
  authenticationService = inject(AuthenticationService);

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.updateLoginView(event.url);
      }
    });
  }

  async ngOnInit() {
    await this.authenticationService.checkLogin();
  }

  private updateLoginView(url: string): void {
    this.authenticationService.isLoginSignUpView = ['/', '/login', '/signUp'].includes(url);
  }
}
