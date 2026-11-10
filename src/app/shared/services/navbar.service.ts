import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NavbarService {
  private selected = '';

  /**
   * Stores the active menu item.
   * @param selection - Name of the menu item.
   */
  setSelection(selection: string) {
    this.selected = selection;
  }

  /**
   * Gets the active menu item.
   * @returns Name of the menu item.
   */
  getSelection() {
    return this.selected;
  }
}
