import { Injectable, signal } from '@angular/core';

const TOAST_DURATION = 2500;

/**
 * Shared toast message ("saved", "changed", "deleted" feedback).
 * Shown by <app-toast />, which has to be placed once in app.html.
 */
@Injectable({
    providedIn: 'root',
})
export class ToastService {
    readonly message = signal('');
    readonly isVisible = signal(false);
    private timer: ReturnType<typeof setTimeout> | null = null;

    /**
     * Shows a message and hides it again after a short time.
     * @param message - Text to display.
     */
    show(message: string): void {
        this.message.set(message);
        this.isVisible.set(true);
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => this.isVisible.set(false), TOAST_DURATION);
    }
}