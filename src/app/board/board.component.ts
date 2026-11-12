import { Component, inject, OnInit, signal } from '@angular/core';
import { NavbarService } from '../shared/services/navbar.service';
import { Task, TaskStatus } from '../shared/models/task.model';
import { BOARD_COLUMNS } from './board-columns';

@Component({
  selector: 'app-board',
  standalone: true,
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss', './board.responsive.scss'],
})
export class BoardComponent implements OnInit {
  private readonly navbarService = inject(NavbarService);

  readonly columns = BOARD_COLUMNS;
  readonly tasks = signal<Task[]>([]);

  /**
   * Marks the board as the active menu item.
   */
  ngOnInit(): void {
    this.navbarService.setSelection('board');
  }

  /**
   * Returns the tasks that belong to one column.
   * @param status - Status of the column.
   * @returns Tasks with this status.
   */
  tasksOf(status: TaskStatus): Task[] {
    return this.tasks().filter((task) => task.status === status);
  }
}
