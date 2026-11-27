import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthenticationService } from '../../shared/services/authentication.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss', './sidebar.responsive.scss'],
})
export class SidebarComponent {
  readonly authenticationService = inject(AuthenticationService);

  menuItems = [
    { label: 'Summary', path: '/success', icon: 'assets/icons/summary.svg' },
    { label: 'Add Task', path: '/addTask', icon: 'assets/icons/add-task.svg' },
    { label: 'Board', path: '/board', icon: 'assets/icons/board.svg' },
    { label: 'Contacts', path: '/contacts', icon: 'assets/icons/contacts.svg' },
  ];
}
