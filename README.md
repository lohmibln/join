# Join

**Join** is a web app for organizing teamwork: manage contacts, create tasks, and track progress on a shared Kanban board.

It is built as a modern Angular client with **Supabase** as the backend (auth + database + realtime), inspired by the classic Join product scope (login, summary, board, add task, contacts).

---

## Product scope

Join covers the full day-to-day flow of a small project team:

### Authentication
- **Log in** with email and password  
- **Sign up** for a new account  
- **Guest log in** for quick demos without creating an account  
- Protected routes after login  
- Legal pages: Privacy Policy & Legal Notice  

### Summary (Join 360)
- Personal greeting for the logged-in user  
- Key metrics at a glance: to-do, done, tasks in board, urgent tasks, upcoming deadline  
- Quick navigation into the board  

### Board
- Kanban columns: **To do**, **In progress**, **Await feedback**, **Done**  
- Search tasks  
- Open task details in an overlay  
- Add tasks from the board (desktop overlay / mobile page)  
- Move tasks between statuses  

### Add Task
- Create tasks with title, description, due date, priority, category  
- Assign contacts  
- Optional subtasks  
- Confirmation when a task is added to the board  

### Contacts
- Alphabetically grouped contact list  
- Contact detail view  
- **Add**, **edit**, and **delete** contacts  
- Name, email, phone validation  
- Consistent avatar colors stored with each contact  
- Live updates when contacts change (Supabase Realtime)  

### App shell
- Sidebar navigation (Summary, Add Task, Board, Contacts)  
- Header with user context / help  

---

## This repository

This repo implements Join with **Angular 22** and **Supabase**.

**Currently in good shape here:** login (incl. intro animation), guest login, contacts (CRUD + realtime), shared Supabase setup.

**Still to complete toward full scope:** summary, board, add task, full sign-up UI, legal pages — matching the feature set above.

---

## Tech stack

| Area | Technology |
|------|------------|
| Frontend | Angular 22 (standalone components), SCSS |
| Backend | [Supabase](https://supabase.com) |
| Auth | Supabase Auth |
| Database | PostgreSQL |
| Realtime | Supabase Realtime |

---

## Getting started

### Requirements
- Node.js (LTS recommended)  
- npm  
- Access to the team Supabase project  

### Install & run

```bash
npm install
npm start
```

App: [http://localhost:4200](http://localhost:4200)

### Environment

Configure Supabase in:

`src/environments/environment.ts`

Use the shared **project URL** and **publishable key**. Never commit the secret/service-role key.

### Supabase SQL (new project)

In `/supabase`:

- `contacts.sql` — contacts table + RLS  
- `contacts-realtime.sql` — enable live contact updates  

Run once in the Supabase SQL Editor if needed.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Dev server (port 4200) |
| `npm run build` | Production build |
| `npm test` | Unit tests |

---

## License

Free to use, free to share, free to modify.

You may use this project for learning, demos, and your own work **as long as it stays free**: do not sell this project itself or a closed paid redistribution of it as a product. Attribution to the original Join / team project is appreciated.

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software to use, copy, modify, and distribute it for free, subject to
the following conditions:

- The software (or substantial copies of it) must remain free of charge.
- Commercial sale of this software as a paid product is not allowed.
- The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
```
