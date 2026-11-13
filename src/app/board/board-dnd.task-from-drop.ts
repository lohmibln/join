import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Task } from '../shared/models/task.model';

/** Reads the dragged task from a CDK drop event (`cdkDragData`). */
export function taskFromDropEvent(event: CdkDragDrop<Task[]>): Task | null {
  const task = event.item.data as Task | undefined;
  return task?.id ? task : null;
}
