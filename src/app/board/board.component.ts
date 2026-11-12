import { Component, inject, OnInit } from '@angular/core';
import { NavbarService } from '../shared/services/navbar.service';

@Component({
  selector: 'app-board',
  standalone: true,
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss', './board.responsive.scss'],
})
export class BoardComponent implements OnInit {
  private readonly navbarService = inject(NavbarService);

  /**
   * Marks the board as the active menu item.
   */
  ngOnInit(): void {
    this.navbarService.setSelection('board');
  }
}
