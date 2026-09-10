/**
 * In-browser stand-in for the three NestJS servers, used on the deployed
 * GitHub Pages build where there is no backend. It reproduces the same
 * routes, status codes, error-body shape, pagination shape, validation
 * messages, 404s and the project-delete cascade. The real API code is
 * unchanged and still runs locally against Postgres.
 */
import type { Assignment } from './api';

export function isMockMode(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.has('mock')) return true;
  if (params.has('live')) return false;
  const host = window.location.hostname;
  return host !== 'localhost' && host !== '127.0.0.1';
}

const SEED_TS = '2026-09-10T06:20:57.000Z';

interface MUser {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}
interface MProject {
  id: number;
  name: string;
  createdAt: string;
  ownerId: number;
}
interface MTag {
  id: number;
  name: string;
}
interface MTask {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: number;
  dueDate: string | null;
  createdAt: string;
  projectId: number;
  assigneeId: number | null;
  tagIds: number[];
}
interface MComment {
  id: number;
  body: string;
  createdAt: string;
  taskId: number;
  authorId: number;
}

interface Db {
  users: MUser[];
  projects: MProject[];
  tags: MTag[];
  tasks: MTask[];
  comments: MComment[];
  seq: { project: number; task: number; comment: number };
}

function seed(): Db {
  return {
    users: [
      { id: 1, name: 'Margaret Hamilton', email: 'margaret@example.com', createdAt: SEED_TS },
      { id: 2, name: 'Alan Turing', email: 'alan@example.com', createdAt: SEED_TS },
      { id: 3, name: 'Ada Lovelace', email: 'ada@example.com', createdAt: SEED_TS },
      { id: 4, name: 'Grace Hopper', email: 'grace@example.com', createdAt: SEED_TS },
      { id: 5, name: 'Katherine Johnson', email: 'katherine@example.com', createdAt: SEED_TS },
      { id: 6, name: 'Linus Torvalds', email: 'linus@example.com', createdAt: SEED_TS },
    ],
    projects: [
      { id: 1, name: 'Apollo Guidance', createdAt: SEED_TS, ownerId: 1 },
      { id: 2, name: 'Website Redesign', createdAt: SEED_TS, ownerId: 4 },
    ],
    tags: [
      { id: 1, name: 'bug' },
      { id: 2, name: 'feature' },
      { id: 3, name: 'urgent' },
      { id: 4, name: 'docs' },
    ],
    tasks: [
      { id: 1, title: 'Write the landing sequence', description: 'Descent guidance for the LM', status: 'in_progress', priority: 1, dueDate: null, createdAt: SEED_TS, projectId: 1, assigneeId: 1, tagIds: [3, 2] },
      { id: 2, title: 'Rope memory review', description: null, status: 'todo', priority: 2, dueDate: null, createdAt: SEED_TS, projectId: 1, assigneeId: 2, tagIds: [4] },
      { id: 3, title: 'Simulate abort modes', description: 'Cover every staging failure', status: 'todo', priority: 1, dueDate: null, createdAt: SEED_TS, projectId: 1, assigneeId: 3, tagIds: [] },
      { id: 4, title: 'New nav bar', description: 'Sticky, collapses on scroll', status: 'in_progress', priority: 3, dueDate: null, createdAt: SEED_TS, projectId: 2, assigneeId: 4, tagIds: [2] },
      { id: 5, title: 'Dark mode pass', description: null, status: 'todo', priority: 4, dueDate: null, createdAt: SEED_TS, projectId: 2, assigneeId: 4, tagIds: [2] },
      { id: 6, title: 'Ship v2 hero', description: 'Copy + illustration', status: 'done', priority: 2, dueDate: null, createdAt: SEED_TS, projectId: 2, assigneeId: 5, tagIds: [2] },
    ],
    comments: [
      { id: 1, body: 'Throttle profile looks off past 8000 ft - check the tables.', createdAt: SEED_TS, taskId: 1, authorId: 2 },
      { id: 2, body: 'Agreed, re-running the sim now.', createdAt: SEED_TS, taskId: 1, authorId: 3 },
      { id: 3, body: 'Fixed in the latest rope. Closing this thread.', createdAt: SEED_TS, taskId: 1, authorId: 1 },
      { id: 4, body: 'Can we get the collapsed height down to 48px?', createdAt: SEED_TS, taskId: 4, authorId: 5 },
      { id: 5, body: 'Done, pushed.', createdAt: SEED_TS, taskId: 4, authorId: 4 },
    ],
    seq: { project: 2, task: 6, comment: 5 },
  };
}

let db = seed();

class HttpError extends Error {
  status: number;
  payload: string | string[];
  constructor(status: number, payload: string | string[]) {
    super(Array.isArray(payload) ? payload.join('; ') : payload);
    this.status = status;
    this.payload = payload;
  }
}

const notFound = (msg: string) => new HttpError(404, msg);
const badRequest = (msgs: string | string[]) => new HttpError(400, msgs);

/* ---- serializers: match the real API JSON ---- */

const sUser = (u: MUser) => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt });
const sTag = (t: MTag) => ({ id: t.id, name: t.name });
const sProjectFlat = (p: MProject) => ({ id: p.id, name: p.name, createdAt: p.createdAt });
const sProjectWithOwner = (p: MProject) => ({
  id: p.id,
  name: p.name,
  createdAt: p.createdAt,
  owner: sUser(db.users.find((u) => u.id === p.ownerId)!),
});
const sTaskFlat = (t: MTask) => ({
  id: t.id,
  title: t.title,
  description: t.description,
  status: t.status,
  priority: t.priority,
  dueDate: t.dueDate,
  createdAt: t.createdAt,
});
const sTaskFull = (t: MTask, withCount: boolean) => {
  const project = db.projects.find((p) => p.id === t.projectId);
  const assignee = t.assigneeId ? db.users.find((u) => u.id === t.assigneeId) : null;
  return {
    ...sTaskFlat(t),
    project: project ? sProjectFlat(project) : null,
    assignee: assignee ? sUser(assignee) : null,
    tags: t.tagIds.map((id) => sTag(db.tags.find((tag) => tag.id === id)!)).filter(Boolean),
    ...(withCount ? { commentCount: db.comments.filter((c) => c.taskId === t.id).length } : {}),
  };
};
const sCommentFlat = (c: MComment) => ({ id: c.id, body: c.body, createdAt: c.createdAt });
const sCommentFull = (c: MComment) => ({
  body: c.body,
  task: sTaskFlat(db.tasks.find((t) => t.id === c.taskId)!),
  author: sUser(db.users.find((u) => u.id === c.authorId)!),
  id: c.id,
  createdAt: c.createdAt,
});

/* ---- validation, mirroring class-validator defaults ---- */

const STATUSES = ['todo', 'in_progress', 'done'];

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function validateCreateTask(body: unknown): string[] {
  if (!isPlainObject(body)) return ['title must be longer than or equal to 3 characters'];
  const allowed = ['title', 'description', 'status', 'priority', 'projectId', 'assigneeId', 'tagIds'];
  const errors: string[] = [];
  for (const key of Object.keys(body)) {
    if (!allowed.includes(key)) errors.push(`property ${key} should not exist`);
  }
  const { title, status, priority, projectId } = body;
  if (typeof title !== 'string' || title.length < 3) {
    errors.push('title must be longer than or equal to 3 characters');
  }
  if (status !== undefined && (typeof status !== 'string' || !STATUSES.includes(status))) {
    errors.push('status must be one of the following values: todo, in_progress, done');
  }
  if (priority !== undefined) {
    const p = Number(priority);
    if (!Number.isInteger(p)) errors.push('priority must be an integer number');
    else if (p > 5) errors.push('priority must not be greater than 5');
    else if (p < 1) errors.push('priority must not be less than 1');
  }
  const pid = Number(projectId);
  if (projectId === undefined || !Number.isInteger(pid)) {
    errors.push('projectId must be an integer number');
  }
  return errors;
}

/* ---- helpers ---- */

function delay(): Promise<void> {
  return new Promise((r) => setTimeout(r, 40 + Math.random() * 90));
}

function paginate<T>(rows: T[], query: URLSearchParams): { items: T[]; total: number; page: number } {
  const page = Math.max(1, Number(query.get('page') ?? 1) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.get('pageSize') ?? 20) || 20));
  const start = (page - 1) * pageSize;
  return { items: rows.slice(start, start + pageSize), total: rows.length, page };
}

function loadTagsOr404(tagIds: unknown): number[] {
  if (!Array.isArray(tagIds)) return [];
  const ids = tagIds.map(Number).filter((n) => Number.isInteger(n));
  const missing = ids.filter((id) => !db.tags.some((t) => t.id === id));
  if (missing.length) throw notFound(`Tag(s) not found: ${missing.join(', ')}`);
  return ids;
}

/* ---- router ---- */

function route(assignment: Assignment, method: string, rawPath: string, body: unknown): unknown {
  const [pathname, qs] = rawPath.split('?');
  const query = new URLSearchParams(qs ?? '');
  const parts = pathname.split('/').filter(Boolean);

  // a1
  if (assignment === 'a1') {
    if (method === 'GET' && pathname === '/health/db') {
      return { count: db.tasks.length, asOf: new Date().toISOString() };
    }
    if (method === 'GET' && pathname === '/ping') {
      return { ping: 'ping -> pong', pong: 'pong -> ping' };
    }
    throw notFound('Cannot ' + method + ' ' + pathname);
  }

  // /projects (a3)
  if (parts[0] === 'projects') {
    if (method === 'GET' && parts.length === 1) return db.projects.map(sProjectFlat);
    if (method === 'POST' && parts.length === 1) {
      const b = isPlainObject(body) ? body : {};
      if (typeof b.name !== 'string' || b.name.trim().length === 0) {
        throw badRequest(['name should not be empty']);
      }
      const ownerId = Number(b.ownerId);
      if (!Number.isInteger(ownerId)) throw badRequest(['ownerId must be an integer number']);
      if (!db.users.some((u) => u.id === ownerId)) throw notFound(`User ${ownerId} not found`);
      const project: MProject = {
        id: ++db.seq.project,
        name: b.name,
        createdAt: new Date().toISOString(),
        ownerId,
      };
      db.projects.push(project);
      return sProjectWithOwner(project);
    }
    const id = Number(parts[1]);
    const project = db.projects.find((p) => p.id === id);
    if (method === 'GET' && parts.length === 2) {
      if (!project) throw notFound(`Project ${id} not found`);
      return sProjectWithOwner(project);
    }
    if (method === 'PATCH' && parts.length === 2) {
      if (!project) throw notFound(`Project ${id} not found`);
      const b = isPlainObject(body) ? body : {};
      if (b.name !== undefined) {
        if (typeof b.name !== 'string' || b.name.trim().length === 0) {
          throw badRequest(['name should not be empty']);
        }
        project.name = b.name;
      }
      if (b.ownerId !== undefined) {
        const ownerId = Number(b.ownerId);
        if (!db.users.some((u) => u.id === ownerId)) throw notFound(`User ${ownerId} not found`);
        project.ownerId = ownerId;
      }
      return sProjectWithOwner(project);
    }
    if (method === 'DELETE' && parts.length === 2) {
      if (!project) throw notFound(`Project ${id} not found`);
      const taskIds = db.tasks.filter((t) => t.projectId === id).map((t) => t.id);
      db.comments = db.comments.filter((c) => !taskIds.includes(c.taskId));
      db.tasks = db.tasks.filter((t) => t.projectId !== id);
      db.projects = db.projects.filter((p) => p.id !== id);
      return undefined; // 204
    }
  }

  // /tasks/:taskId/comments (a3)
  if (parts[0] === 'tasks' && parts[2] === 'comments') {
    const taskId = Number(parts[1]);
    if (!db.tasks.some((t) => t.id === taskId)) throw notFound(`Task ${taskId} not found`);
    if (method === 'GET') {
      const rows = db.comments.filter((c) => c.taskId === taskId).sort((a, b) => a.id - b.id);
      const paged = paginate(rows, query);
      return { items: paged.items.map(sCommentFlat), total: paged.total, page: paged.page };
    }
    if (method === 'POST') {
      const b = isPlainObject(body) ? body : {};
      if (typeof b.body !== 'string' || b.body.trim().length === 0) {
        throw badRequest(['body should not be empty']);
      }
      const authorId = Number(b.authorId);
      if (!Number.isInteger(authorId)) throw badRequest(['authorId must be an integer number']);
      if (!db.users.some((u) => u.id === authorId)) throw notFound(`User ${authorId} not found`);
      const comment: MComment = {
        id: ++db.seq.comment,
        body: b.body,
        createdAt: new Date().toISOString(),
        taskId,
        authorId,
      };
      db.comments.push(comment);
      return sCommentFull(comment);
    }
  }

  // /tasks (a2 + a3)
  if (parts[0] === 'tasks') {
    const withCount = assignment === 'a3';
    if (method === 'GET' && parts.length === 1) {
      let rows = [...db.tasks].sort((a, b) => a.id - b.id);
      const status = query.get('status');
      const projectId = query.get('projectId');
      const assigneeId = query.get('assigneeId');
      if (status) rows = rows.filter((t) => t.status === status);
      if (projectId) rows = rows.filter((t) => t.projectId === Number(projectId));
      if (assigneeId) rows = rows.filter((t) => t.assigneeId === Number(assigneeId));
      const paged = paginate(rows, query);
      return { items: paged.items.map(sTaskFlat), total: paged.total, page: paged.page };
    }
    if (method === 'POST' && parts.length === 1) {
      const errors = validateCreateTask(body);
      if (errors.length) throw badRequest(errors);
      const b = body as Record<string, unknown>;
      const projectId = Number(b.projectId);
      if (!db.projects.some((p) => p.id === projectId)) {
        throw notFound(`Project ${projectId} not found`);
      }
      let assigneeId: number | null = null;
      if (b.assigneeId != null) {
        assigneeId = Number(b.assigneeId);
        if (!db.users.some((u) => u.id === assigneeId)) {
          throw notFound(`User ${assigneeId} not found`);
        }
      }
      const tagIds = loadTagsOr404(b.tagIds);
      const task: MTask = {
        id: ++db.seq.task,
        title: String(b.title),
        description: b.description ? String(b.description) : null,
        status: typeof b.status === 'string' ? b.status : 'todo',
        priority: b.priority != null ? Number(b.priority) : 3,
        dueDate: null,
        createdAt: new Date().toISOString(),
        projectId,
        assigneeId,
        tagIds,
      };
      db.tasks.push(task);
      return sTaskFull(task, withCount);
    }
    const id = Number(parts[1]);
    const task = db.tasks.find((t) => t.id === id);
    if (method === 'GET' && parts.length === 2) {
      if (!task) throw notFound(`Task ${id} not found`);
      return sTaskFull(task, withCount);
    }
    if (method === 'PATCH' && parts.length === 2) {
      if (!task) throw notFound(`Task ${id} not found`);
      const b = isPlainObject(body) ? body : {};
      const extra = Object.keys(b).filter(
        (k) =>
          !['title', 'description', 'status', 'priority', 'projectId', 'assigneeId', 'tagIds'].includes(
            k,
          ),
      );
      if (extra.length) throw badRequest(extra.map((k) => `property ${k} should not exist`));
      if (b.projectId != null) {
        const pid = Number(b.projectId);
        if (!db.projects.some((p) => p.id === pid)) throw notFound(`Project ${pid} not found`);
        task.projectId = pid;
      }
      if (b.assigneeId != null) {
        const aid = Number(b.assigneeId);
        if (!db.users.some((u) => u.id === aid)) throw notFound(`User ${aid} not found`);
        task.assigneeId = aid;
      }
      if (b.tagIds) task.tagIds = loadTagsOr404(b.tagIds);
      if (typeof b.title === 'string') {
        if (b.title.length < 3) throw badRequest(['title must be longer than or equal to 3 characters']);
        task.title = b.title;
      }
      if (b.description !== undefined) task.description = b.description ? String(b.description) : null;
      if (typeof b.status === 'string') {
        if (!STATUSES.includes(b.status)) {
          throw badRequest(['status must be one of the following values: todo, in_progress, done']);
        }
        task.status = b.status;
      }
      if (b.priority !== undefined) {
        const p = Number(b.priority);
        if (!Number.isInteger(p) || p < 1 || p > 5) {
          throw badRequest(['priority must not be greater than 5']);
        }
        task.priority = p;
      }
      return sTaskFull(task, withCount);
    }
    if (method === 'DELETE' && parts.length === 2) {
      if (!task) throw notFound(`Task ${id} not found`);
      db.comments = db.comments.filter((c) => c.taskId !== id);
      db.tasks = db.tasks.filter((t) => t.id !== id);
      return undefined; // 204
    }
  }

  throw notFound('Cannot ' + method + ' ' + pathname);
}

export async function mockRequest(
  assignment: Assignment,
  method: string,
  path: string,
  body: unknown,
): Promise<{ status: number; data: unknown }> {
  await delay();
  try {
    const data = route(assignment, method, path, body);
    return { status: method === 'DELETE' ? 204 : method === 'POST' ? 201 : 200, data };
  } catch (err) {
    if (err instanceof HttpError) {
      return {
        status: err.status,
        data: {
          statusCode: err.status,
          message: err.payload,
          path,
          timestamp: new Date().toISOString(),
        },
      };
    }
    return {
      status: 500,
      data: {
        statusCode: 500,
        message: 'Internal server error',
        path,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
