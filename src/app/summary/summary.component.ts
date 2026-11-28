import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { isBoardMobileViewport } from '../board/board.utils';
import { AuthenticationService } from '../shared/services/authentication.service';
import { TasksService } from '../shared/services/tasks.service';
import {
    GREETING_DURATION_MS,
    countTasksByStatus,
    formatDeadline,
    getGreeting,
    getUrgentSummary,
} from './summary.utils';

/** Dashboard with task counts, urgent tasks and a greeting. */
@Component({
    selector: 'app-summary',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './summary.component.html',
    styleUrls: ['./summary.component.scss', './summary.responsive.scss'],
})
export class SummaryComponent implements OnInit, OnDestroy {
    private readonly tasksService = inject(TasksService);
    private readonly authenticationService = inject(AuthenticationService);

    readonly counts = computed(() => countTasksByStatus(this.tasksService.tasks()));
    readonly urgent = computed(() => getUrgentSummary(this.tasksService.tasks()));
    readonly deadlineText = computed(() => {
        const deadline = this.urgent().nextDeadline;
        return deadline ? formatDeadline(deadline) : null;
    });

    readonly greeting = getGreeting();
    readonly userName = this.getUserName();
    readonly showGreetingScreen = signal(false);

    private greetingTimer: ReturnType<typeof setTimeout> | null = null;

    /** Shows the mobile greeting once, loads the tasks and keeps them live. */
    async ngOnInit(): Promise<void> {
        this.startGreetingScreen();
        await this.tasksService.loadTasks();
        this.tasksService.startRealtime();
    }

    /** Stops the live updates and the greeting timer when the page is left. */
    ngOnDestroy(): void {
        this.tasksService.stopRealtime();

        if (this.greetingTimer) {
            clearTimeout(this.greetingTimer);
        }
    }

    /** Shows the greeting screen once after login, on mobile only. */
    private startGreetingScreen(): void {
        if (!isBoardMobileViewport() || this.authenticationService.isGreetingShown) {
            return;
        }

        this.authenticationService.isGreetingShown = true;
        this.showGreetingScreen.set(true);
        this.greetingTimer = setTimeout(
            () => this.showGreetingScreen.set(false),
            GREETING_DURATION_MS,
        );
    }

    /**
     * Gets the name for the greeting.
     * @returns Full name of a registered user, or an empty text for guests.
     */
    private getUserName(): string {
        const user = this.authenticationService.currentLoggedInUser;

        if (!user || user.is_anonymous) {
            return '';
        }

        return user.user_metadata?.['full_name'] ?? '';
    }
}