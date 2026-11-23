import { Injectable, signal } from '@angular/core';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { NewTask, Task } from '../models/task.model';
import { sortTasksByPosition } from '../utils/task-order.utils';
import { supabase } from './supabase.client';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  readonly tasks = signal<Task[]>([]);
  readonly errorMessage = signal('');

  private realtimeChannel: RealtimeChannel | null = null;

  /** True once Supabase delivers a position for the tasks, so the order can be saved. */
  private orderSupported = false;

  /**
   * Loads all tasks from Supabase.
   */
  async loadTasks(): Promise<void> {
    const { data, error } = await supabase.from('tasks').select('*');

    if (error) {
      this.errorMessage.set('Tasks could not be loaded. Please try again later.');
      return;
    }

    this.errorMessage.set('');
    const rows = (data ?? []) as Task[];
    this.orderSupported = rows.length > 0 && 'position' in rows[0];
    this.tasks.set(sortTasksByPosition(rows));
  }

  /**
   * Starts a live subscription, so tasks of other users show up without reloading.
   */
  startRealtime(): void {
    if (this.realtimeChannel) {
      return;
    }

    this.realtimeChannel = supabase
      .channel('tasks-live')
      .on<Task>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => this.applyRealtimeChange(payload),
      )
      .subscribe();
  }

  /** Stops the live tasks subscription. */
  stopRealtime(): void {
    if (!this.realtimeChannel) {
      return;
    }

    void supabase.removeChannel(this.realtimeChannel);
    this.realtimeChannel = null;
  }

  /**
   * Saves a new task and adds it to the list.
   * @param newTask - Task data without id.
   * @returns The saved task, or null if saving failed.
   */
  async addTask(newTask: NewTask): Promise<Task | null> {
    const { data, error } = await supabase.from('tasks').insert(newTask).select().single();

    if (error || !data) {
      this.errorMessage.set('Task could not be saved. Please try again later.');
      return null;
    }

    this.errorMessage.set('');
    this.upsertLocal(data as Task);
    return data as Task;
  }

  /**
   * Saves the changes of a task. The list is updated right away, so the board
   * does not wait for the server, and is reset if saving fails.
   * @param task - Task with its new values.
   * @returns True if the task was saved.
   */
  async updateTask(task: Task): Promise<boolean> {
    const previous = this.tasks();
    this.upsertLocal(task);
    const { id, ...fields } = task;
    const { error } = await supabase.from('tasks').update(fields).eq('id', id);

    if (error) {
      this.tasks.set(previous);
      this.errorMessage.set('Task could not be updated. Please try again later.');
      return false;
    }

    this.errorMessage.set('');
    return true;
  }

  /**
 * Deletes a task. The list is updated right away and reset if deleting fails.
 * @param id - Id of the task to delete.
 * @returns True if the task was deleted.
 */
  async deleteTask(id: string): Promise<boolean> {
    const previous = this.tasks();
    this.tasks.update((tasks) => tasks.filter((entry) => entry.id !== id));
    const { data, error } = await supabase.from('tasks').delete().eq('id', id).select('id');

    if (error || !data?.length) {
      this.tasks.set(previous);
      this.errorMessage.set('Task could not be deleted. Please try again later.');
      return false;
    }

    this.errorMessage.set('');
    return true;
  }

  /**
   * Replaces the order of the local list, e.g. after a card was dropped between two others.
   * The order is only kept on this device until the tasks are loaded again.
   * @param tasks - The same tasks in their new order.
   */
  reorderLocal(tasks: Task[]): void {
    this.tasks.set(tasks);
  }

  /**
   * Applies a live change from Supabase to the list.
   * @param payload - Change sent by Supabase Realtime.
   */
  private applyRealtimeChange(payload: RealtimePostgresChangesPayload<Task>): void {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      this.upsertLocal(payload.new as Task);
      return;
    }

    const removed = payload.old as Partial<Task>;
    if (payload.eventType === 'DELETE' && removed.id) {
      this.tasks.update((tasks) => tasks.filter((entry) => entry.id !== removed.id));
    }
  }

  /**
   * Adds a task to the list or replaces its old version.
   * @param task - Task to store.
   */
  private upsertLocal(task: Task): void {
    this.tasks.update((tasks) => {
      const index = tasks.findIndex((entry) => entry.id === task.id);
      if (index === -1) {
        return [...tasks, task];
      }
      const next = [...tasks];
      next[index] = task;
      return next;
    });
  }
}
