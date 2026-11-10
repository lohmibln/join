import { Component, input, output } from '@angular/core';

/**
 * Asks the user to confirm before a contact is deleted for good.
 * Layout and buttons are shared with the add contact dialog.
 */
@Component({
    selector: 'app-confirm-delete-dialog',
    standalone: true,
    templateUrl: './confirm-delete-dialog.component.html',
    styleUrls: [
        '../add-contact-dialog/add-contact-dialog.component.scss',
        './confirm-delete-dialog.component.scss',
    ],
    host: { '(document:keydown.escape)': 'close()' },
})
export class ConfirmDeleteDialogComponent {
    readonly contactName = input.required<string>();
    readonly isDeleting = input(false);

    readonly closed = output<void>();
    readonly confirmed = output<void>();

    close(): void {
        this.closed.emit();
    }

    confirm(): void {
        if (this.isDeleting()) return;
        this.confirmed.emit();
    }

    onOverlayClick(event: MouseEvent): void {
        if (event.target === event.currentTarget) this.close();
    }
}