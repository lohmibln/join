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
        '../add-contact-dialog/add-contact-dialog.responsive.scss',
        './confirm-delete-dialog.component.scss',
    ],
    host: { '(document:keydown.escape)': 'close()' },
})
export class ConfirmDeleteDialogComponent {
    readonly contactName = input.required<string>();
    readonly isDeleting = input(false);

    readonly closed = output<void>();
    readonly confirmed = output<void>();

    /**
     * Closes the dialog without deleting anything.
     */
    close(): void {
        this.closed.emit();
    }

    /**
     * Reports that the user confirmed the delete.
     */
    confirm(): void {
        if (this.isDeleting()) return;
        this.confirmed.emit();
    }

    /**
     * Closes the dialog when the dark background is clicked.
     * @param event - Click event of the overlay.
     */
    onOverlayClick(event: MouseEvent): void {
        if (event.target === event.currentTarget) this.close();
    }
}