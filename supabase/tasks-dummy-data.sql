-- Run once in Supabase → SQL Editor → New query → Run (after tasks.sql)
-- Adds realistic demo tasks. Contacts are looked up by name, so the contacts must exist.
-- Due dates are relative to today, so none of them lies in the past.

insert into public.tasks (title, description, category, status, prio, due_date, assigned_to, sub_tasks)
values
  (
    'Kochwelt Page & Recipe Recommender',
    'Build the start page with a recipe recommendation based on the time of day.',
    'User Story', 'inProgress', 'Medium', current_date + 5,
    array(select id from public.contacts where full_name in ('Lukas Meier', 'Nina Fischer', 'Oliver Becker', 'Paula Keller', 'Sophia Gruber')),
    '[
      {"description": "Implement the recipe card layout", "checked": true},
      {"description": "Load recipes from the database", "checked": false},
      {"description": "Recommend a recipe by time of day", "checked": false},
      {"description": "Write tests for the recommendation", "checked": false}
    ]'::jsonb
  ),
  (
    'HTML Base Template Creation',
    'Create a reusable HTML base template with header, navigation and footer.',
    'Technical Task', 'awaitFeedback', 'Low', current_date + 3,
    array(select id from public.contacts where full_name in ('Tim Fuchs', 'Lena Schulz')),
    '[
      {"description": "Define the page structure", "checked": true},
      {"description": "Add header and footer partials", "checked": true}
    ]'::jsonb
  ),
  (
    'CSS Architecture Planning',
    'Define the CSS naming conventions and the folder structure for the styles.',
    'Technical Task', 'done', 'Urgent', current_date + 1,
    array(select id from public.contacts where full_name in ('Nico Braun', 'Bärbel Schmidt', 'Hannes Traubel')),
    '[
      {"description": "Agree on naming conventions", "checked": true},
      {"description": "Set up variables and mixins", "checked": true}
    ]'::jsonb
  ),
  (
    'Contact Form & Imprint',
    'Create a contact form and an imprint page that match the design.',
    'User Story', 'toDo', 'Urgent', current_date + 7,
    array(select id from public.contacts where full_name in ('Olivia Lehmann', 'Herbert Vogel')),
    '[
      {"description": "Build the contact form with validation", "checked": false},
      {"description": "Write the imprint text", "checked": false}
    ]'::jsonb
  );
