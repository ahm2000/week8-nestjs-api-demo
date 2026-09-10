export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Project {
  id: number;
  name: string;
  createdAt: string;
  owner?: User;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: number;
  dueDate: string | null;
  createdAt: string;
  project?: Project;
  assignee?: User | null;
  tags?: Tag[];
  commentCount?: number;
}

export interface Comment {
  id: number;
  body: string;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
}

export interface DbHealth {
  count: number;
  asOf: string;
}

export interface PingPong {
  ping: string;
  pong: string;
}

export const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];
