import { Task, TaskStatus } from '../shared/models/task.model';

/** How long the mobile greeting screen stays visible (keep in sync with the CSS animation). */
export const GREETING_DURATION_MS = 2000;

/** Number of tasks per status, shown on the summary cards. */
export interface TaskCounts {
    total: number;
    toDo: number;
    inProgress: number;
    awaitFeedback: number;
    done: number;
}

/** Urgent summary card: open urgent tasks and their nearest deadline. */
export interface UrgentSummary {
    count: number;
    nextDeadline: string | null;
}


/**
 * Counts how many tasks are in each status.
 * @param tasks - All tasks of the board.
 * @returns Counts per status and the total.
 */
export function countTasksByStatus(tasks: Task[]): TaskCounts {
    const countOf = (status: TaskStatus) => tasks.filter((task) => task.status === status).length;

    return {
        total: tasks.length,
        toDo: countOf('toDo'),
        inProgress: countOf('inProgress'),
        awaitFeedback: countOf('awaitFeedback'),
        done: countOf('done'),
    };
}


/**
 * Collects the urgent tasks that are not done yet.
 * @param tasks - All tasks of the board.
 * @returns Number of urgent tasks and the earliest due date (YYYY-MM-DD), or null.
 */
export function getUrgentSummary(tasks: Task[]): UrgentSummary {
    const urgent = tasks.filter((task) => task.prio === 'Urgent' && task.status !== 'done');
    const dueDates = urgent.map((task) => task.due_date).sort();

    return { count: urgent.length, nextDeadline: dueDates[0] ?? null };
}


/**
 * Formats a due date like "October 16, 2022".
 * @param isoDate - Date as YYYY-MM-DD.
 * @returns Readable English date.
 */
export function formatDeadline(isoDate: string): string {
    const [year, month, day] = isoDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}


/**
 * Returns a greeting that depends on the time of day.
 * @param date - Moment to greet for (defaults to now).
 * @returns "Good morning", "Good afternoon" or "Good evening".
 */
export function getGreeting(date = new Date()): string {
    const hour = date.getHours();

    if (hour < 12) {
        return 'Good morning';
    }

    return hour < 18 ? 'Good afternoon' : 'Good evening';
}