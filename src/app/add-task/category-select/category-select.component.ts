import { Component, ElementRef, inject, input, output, signal } from '@angular/core';
import { TaskCategory } from '../../shared/models/task.model';

export const TASK_CATEGORIES: TaskCategory[] = ['Technical Task', 'User Story'];

/**
 * Dropdown to choose the category of a task.
 * Closes again when the user clicks somewhere else.
 */
@Component({
  selector: 'app-category-select',
  standalone: true,
  templateUrl: './category-select.component.html',
  styleUrls: [
    './category-select.component.scss',
    '../assigned-to-select/assigned-to-select.component.scss',
  ],
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class CategorySelectComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly value = input<TaskCategory | ''>('');
  readonly hasError = input(false);
  readonly valueChange = output<TaskCategory>();
  readonly closed = output<void>();

  readonly categories = TASK_CATEGORIES;
  readonly isOpen = signal(false);

  /** Opens or closes the list. Closing counts as leaving the field. */
  toggle(): void {
    if (this.isOpen()) {
      this.close();
      return;
    }
    this.isOpen.set(true);
  }

  /**
   * Takes the clicked category and closes the list.
   * @param category - Chosen category.
   */
  choose(category: TaskCategory): void {
    this.valueChange.emit(category);
    this.isOpen.set(false);
  }

  /** Closes the list and tells the form, so it can check the field. */
  close(): void {
    if (!this.isOpen()) {
      return;
    }
    this.isOpen.set(false);
    this.closed.emit();
  }

  /**
   * Closes the list when the click was outside of this dropdown.
   * @param event - Click anywhere on the page.
   */
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
