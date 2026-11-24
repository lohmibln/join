import { Component, ElementRef, effect, input, output, signal, viewChild } from '@angular/core';

/**
 * Input to add subtasks and a list to edit or delete them.
 */
@Component({
  selector: 'app-subtasks-input',
  standalone: true,
  templateUrl: './subtasks-input.component.html',
  styleUrl: './subtasks-input.component.scss',
})
export class SubtasksInputComponent {
  readonly subtasks = input<string[]>([]);
  readonly subtasksChange = output<string[]>();

  readonly draft = signal('');
  readonly editIndex = signal<number | null>(null);
  readonly editText = signal('');
  readonly editInput = viewChild<ElementRef<HTMLInputElement>>('editInput');

  constructor() {
    effect(() => this.editInput()?.nativeElement.focus());
  }

  /**
   * Stores the text of the new subtask.
   * @param event - Input event of the field.
   */
  onDraftInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }

  /**
   * Adds the typed subtask to the list. Empty text is ignored.
   * @param event - Optional key event, so Enter does not submit the form.
   */
  add(event?: Event): void {
    event?.preventDefault();
    const text = this.draft().trim();
    if (!text) return;
    this.subtasksChange.emit([...this.subtasks(), text]);
    this.draft.set('');
  }

  /** Empties the field for a new subtask. */
  clearDraft(): void {
    this.draft.set('');
  }

  /**
   * Removes one subtask.
   * @param index - Position of the subtask in the list.
   * @param event - Optional click event, so the row does not open for editing.
   */
  remove(index: number, event?: Event): void {
    event?.stopPropagation();
    this.subtasksChange.emit(this.subtasks().filter((_, i) => i !== index));
    if (this.editIndex() === index) this.editIndex.set(null);
  }

  /**
   * Opens a subtask for editing.
   * @param index - Position of the subtask in the list.
   */
  startEdit(index: number): void {
    if (this.editIndex() === index) return;
    this.editIndex.set(index);
    this.editText.set(this.subtasks()[index]);
  }

  /**
   * Stores the changed text while editing.
   * @param event - Input event of the edit field.
   */
  onEditInput(event: Event): void {
    this.editText.set((event.target as HTMLInputElement).value);
  }

  /**
   * Saves the edited subtask. Empty text deletes it.
   * @param event - Optional key event, so Enter does not submit the form.
   */
  saveEdit(event?: Event): void {
    event?.preventDefault();
    const index = this.editIndex();
    if (index === null) return;
    const text = this.editText().trim();
    if (!text) return this.remove(index);
    this.subtasksChange.emit(this.subtasks().map((item, i) => (i === index ? text : item)));
    this.editIndex.set(null);
  }
}
