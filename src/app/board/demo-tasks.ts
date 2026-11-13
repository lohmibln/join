import { Task } from '../shared/models/task.model';

/** Temporary demo tasks until Supabase tasks CRUD is wired. */
export const DEMO_TASKS: Task[] = [
  {
    id: 'demo-1',
    title: 'Website redesign',
    description: 'Create a new layout for the Join homepage and improve the navigation.',
    category: 'User Story',
    status: 'todo',
    prio: 'Urgent',
    due_date: '2026-12-01',
    assigned_to: [],
    sub_tasks: [
      { description: 'Sketch wireframes', checked: true },
      { description: 'Implement responsive styles', checked: false },
    ],
  },
  {
    id: 'demo-2',
    title: 'Contact sync',
    description: 'Keep contact list in sync with realtime updates from the database.',
    category: 'Technical Task',
    status: 'inProgress',
    prio: 'Medium',
    due_date: '2026-11-20',
    assigned_to: [],
    sub_tasks: [
      { description: 'Subscribe to postgres_changes', checked: true },
      { description: 'Handle delete events', checked: true },
      { description: 'Add error toast', checked: false },
    ],
  },
  {
    id: 'demo-3',
    title: 'Board feedback',
    description: 'Collect feedback for the board columns and adjust empty states.',
    category: 'User Story',
    status: 'awaitFeedback',
    prio: 'Low',
    due_date: '2026-11-25',
    assigned_to: [],
    sub_tasks: [],
  },
  {
    id: 'demo-4',
    title: 'Auth polish',
    description: 'Finalize login overlay animation and guest login flow.',
    category: 'Technical Task',
    status: 'done',
    prio: 'Medium',
    due_date: '2026-11-10',
    assigned_to: [],
    sub_tasks: [
      { description: 'Guest bypass', checked: true },
      { description: 'Success redirect', checked: true },
    ],
  },
];
