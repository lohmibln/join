import { Component, inject, OnInit } from '@angular/core';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { AuthenticationService } from './shared/services/authentication.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly router = inject(Router);
  authenticationService = inject(AuthenticationService);

  constructor() {
    this.router.events.subscribe((event) => {
      if (!(event instanceof NavigationStart)) {
        return;
      }

      switch (event.url) {
        case '/':
        case '/login':
        case '/signUp':
          this.authenticationService.isLoginSignUpView = true;
          break;
        default:
          this.authenticationService.isLoginSignUpView = false;
          break;
      }
    });
  }

  async ngOnInit() {
    await this.authenticationService.checkLogin();
  }
}
