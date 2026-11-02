import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NavbarService {
  private selected = '';

  setSelection(selection: string) {
    this.selected = selection;
  }

  getSelection() {
    return this.selected;
  }
}
