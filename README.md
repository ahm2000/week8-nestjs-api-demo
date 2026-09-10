# Week 8 · NestJS API — live demo

A small React UI that drives the three Week 8 assignment APIs against the
real `Week_8` Postgres database, so you can see every endpoint respond.
**Not part of any graded submission** — it lives outside the assignment
repos and is never pushed.

## What it shows

| Tab | Server | Endpoints exercised |
|---|---|---|
| **01 Fundamentals** | Assignment 1 · `:3001` | `GET /health/db`, `GET /ping` |
| **02 Tasks API** | Assignment 2 · `:3002` | `POST/GET/GET :id/PATCH/DELETE /tasks`, filters, pagination, validation + 404 errors |
| **03 Projects & Comments** | Assignment 3 · `:3003` | Projects CRUD, `POST/GET /tasks/:id/comments`, the `commentCount` on `GET /tasks/:id`, cascade on project delete |

Every request the UI makes is listed in the **Request log** on the right —
method, path, status, timing, and both bodies — so the API traffic is
visible, not hidden.

## Run it

Four terminals. Each assignment runs on its own port against the shared
`Week_8` database (`.env` in each folder already sets the port).

```
# 1 — Assignment 1  (git worktree, branch Week8/Assignment1)
cd ../Week_8-a1/assignment-1 && npm run start        # -> :3001

# 2 — Assignment 2  (git worktree, branch Week8/Assignment2)
cd ../Week_8-a2/assignment-2 && npm run start        # -> :3002

# 3 — Assignment 3  (main Week_8 checkout, branch Week8/Assignment3)
cd ../Week_8/assignment-3 && npm run start           # -> :3003

# 4 — this UI
npm install
npm run dev                                          # -> http://localhost:5173
```

Then open **http://localhost:5173**. Tabs are deep-linked: `#a1`, `#a2`,
`#a3`.

The Vite dev server proxies `/api/a1|a2|a3/*` to `localhost:3001|3002|3003`,
so the browser only ever talks to `:5173` — no CORS changes were made to
the assignment code.

## Seed data

`seed.sql` loads 6 users (ids 1-6: Margaret, Alan, Ada, Grace, Katherine,
Linus), 2 projects, 6 tasks, 4 tags, and 5 comments. Use a user id 1-6
for any `ownerId` / `assigneeId` / `authorId` field.

```
psql -U postgres -h localhost -d Week_8 -f seed.sql
```

## Where things are

- `src/lib/api.ts` — fetch wrapper; logs every call into the activity log.
- `src/lib/pagination.ts` — mirrors the API's `{ items, total, page }` shape.
- `src/panels/` — one panel per assignment.
- `src/components/TasksExplorer.tsx` / `TaskDetailModal` / `TaskFormModal` —
  shared by the A2 and A3 tabs (A3 adds the comment thread + count).
- `src/components/ProjectsExplorer.tsx` — A3 projects CRUD.
- `src/components/CommentsThread.tsx` — A3 paginated comments.
- `vite.config.ts` — the three-way dev proxy.
