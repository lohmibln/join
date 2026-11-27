import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss', './sidebar.responsive.scss'],
})
export class SidebarComponent {
  menuItems = [
    { label: 'Summary', path: '/success', icon: 'assets/icons/summary.svg' },
    { label: 'Add Task', path: '/addTask', icon: 'assets/icons/add-task.svg' },
    { label: 'Board', path: '/board', icon: 'assets/icons/board.svg' },
    { label: 'Contacts', path: '/contacts', icon: 'assets/icons/contacts.svg' },
  ];
}
