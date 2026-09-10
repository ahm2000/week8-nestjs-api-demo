-- Demo seed data for the Week_8 database.
-- Safe to re-run: it wipes the domain tables first.

TRUNCATE comments, task_tags, tasks, project_members, projects, tags, users
  RESTART IDENTITY CASCADE;

INSERT INTO users (name, email) VALUES
  ('Margaret Hamilton', 'margaret@example.com'),
  ('Alan Turing', 'alan@example.com'),
  ('Ada Lovelace', 'ada@example.com'),
  ('Grace Hopper', 'grace@example.com'),
  ('Katherine Johnson', 'katherine@example.com'),
  ('Linus Torvalds', 'linus@example.com');

INSERT INTO projects (name, owner_id) VALUES
  ('Apollo Guidance', 1),
  ('Website Redesign', 4);

INSERT INTO tags (name) VALUES ('bug'), ('feature'), ('urgent'), ('docs');

INSERT INTO tasks (title, description, status, priority, project_id, assignee_id) VALUES
  ('Write the landing sequence', 'Descent guidance for the LM', 'in_progress', 1, 1, 1),
  ('Rope memory review', NULL, 'todo', 2, 1, 2),
  ('Simulate abort modes', 'Cover every staging failure', 'todo', 1, 1, 3),
  ('New nav bar', 'Sticky, collapses on scroll', 'in_progress', 3, 2, 4),
  ('Dark mode pass', NULL, 'todo', 4, 2, 4),
  ('Ship v2 hero', 'Copy + illustration', 'done', 2, 2, 5);

INSERT INTO task_tags (task_id, tag_id) VALUES (1,3),(1,2),(2,4),(4,2),(5,2),(6,2);

INSERT INTO comments (task_id, author_id, body) VALUES
  (1, 2, 'Throttle profile looks off past 8000 ft - check the tables.'),
  (1, 3, 'Agreed, re-running the sim now.'),
  (1, 1, 'Fixed in the latest rope. Closing this thread.'),
  (4, 5, 'Can we get the collapsed height down to 48px?'),
  (4, 4, 'Done, pushed.');
