import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavbarService } from '../../shared/services/navbar.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss', './sidebar.responsive.scss'],
})
export class SidebarComponent {
  navbarService = inject(NavbarService);

  menuItems = [
    { name: 'success', label: 'Summary', path: '/success', icon: 'assets/icons/summary.svg' },
    { name: 'addTask', label: 'Add Task', path: '/addTask', icon: 'assets/icons/add-task.svg' },
    { name: 'board', label: 'Board', path: '/board', icon: 'assets/icons/board.svg' },
    { name: 'contacts', label: 'Contacts', path: '/contacts', icon: 'assets/icons/contacts.svg' },
  ];
}
