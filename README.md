# Week 8 · NestJS API — demo UI

A React UI that drives the three Week 8 assignment APIs and shows every
request/response. **Not part of any graded submission** — separate repo,
never merged into the assignment code.

**Live:** https://ahm2000.github.io/week8-nestjs-api-demo/

## Two modes

| | Data source | When |
|---|---|---|
| **Mock** | In-browser mock that reproduces every route, status code, error-body shape, pagination shape, validation message, 404, and the project-delete cascade | The deployed GitHub Pages build (any non-`localhost` host), or `?mock` on the URL |
| **Live** | The real NestJS servers over the `Week_8` Postgres database, via the Vite dev-server proxy | Running locally on `localhost` |

The mock exists only so the deployed URL works with no backend. The real
API code is unchanged and is what runs in Live mode.

## What it shows

| Tab | Server (live) | Endpoints exercised |
|---|---|---|
| **01 Fundamentals** | Assignment 1 · `:3001` | `GET /health/db`, `GET /ping` |
| **02 Tasks API** | Assignment 2 · `:3002` | `POST/GET/GET :id/PATCH/DELETE /tasks`, combinable filters, pagination, validation + 404 errors |
| **03 Projects & Comments** | Assignment 3 · `:3003` | Projects CRUD, `POST/GET /tasks/:id/comments`, the `commentCount` on `GET /tasks/:id`, cascade on project delete |

Every request the UI makes is listed in the **Request log** on the right —
method, path, status, timing, and both bodies.

## Run it live (real Postgres)

Four terminals. Each assignment runs on its own port against the shared
`Week_8` database (`.env` in each folder sets the port).

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

Open **http://localhost:5173**. Tabs deep-link: `#a1`, `#a2`, `#a3`.
The Vite proxy sends `/api/a1|a2|a3/*` to `localhost:3001|3002|3003`, so
the browser only talks to `:5173` — no CORS changes to the assignment code.

## Seed data

`seed.sql` loads 6 users (ids 1-6: Margaret, Alan, Ada, Grace, Katherine,
Linus), 2 projects, 6 tasks, 4 tags, 5 comments. The mock backend is
seeded with the exact same rows.

```
psql -U postgres -h localhost -d Week_8 -f seed.sql
```

## Where things are

- `src/lib/api.ts` — request wrapper; picks the mock or the proxy, logs
  every call.
- `src/lib/mockApi.ts` — the in-browser backend.
- `src/lib/types.ts` — shared types, including the `{ items, total, page }` shape.
- `src/panels/` — one panel per assignment.
- `src/components/TasksExplorer.tsx` / `TaskDetailModal` / `TaskFormModal` —
  shared by the A2 and A3 tabs (A3 adds the comment thread + count).
- `src/components/ProjectsExplorer.tsx` — A3 projects CRUD.
- `src/components/CommentsThread.tsx` — A3 paginated comments.
- `vite.config.ts` — dev proxy + the GitHub Pages `base`.
- `.github/workflows/deploy.yml` — build + deploy to Pages on push to `main`.
