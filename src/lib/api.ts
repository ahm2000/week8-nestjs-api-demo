import { addLogEntry } from './activityLog';
import { isMockMode, mockRequest } from './mockApi';

export type Assignment = 'a1' | 'a2' | 'a3';

function extractMessage(body: unknown): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message: unknown }).message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.join('; ');
  }
  return 'Request failed';
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(extractMessage(body));
    this.status = status;
    this.body = body;
  }
}

async function transport(
  assignment: Assignment,
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; data: unknown }> {
  if (isMockMode()) {
    return mockRequest(assignment, method, path, body);
  }
  const res = await fetch(`/api/${assignment}${path}`, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : undefined };
}

async function request<T>(
  assignment: Assignment,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const start = performance.now();
  const { status, data } = await transport(assignment, method, path, body);
  const durationMs = Math.round(performance.now() - start);

  addLogEntry({
    id: crypto.randomUUID(),
    assignment,
    method,
    path,
    status,
    ok: status < 400,
    requestBody: body,
    responseBody: data,
    durationMs,
    timestamp: new Date().toISOString(),
  });

  if (status >= 400) {
    throw new ApiError(status, data);
  }
  return data as T;
}

export const api = {
  get: <T,>(assignment: Assignment, path: string): Promise<T> => request<T>(assignment, 'GET', path),
  post: <T,>(assignment: Assignment, path: string, body?: unknown): Promise<T> =>
    request<T>(assignment, 'POST', path, body),
  patch: <T,>(assignment: Assignment, path: string, body?: unknown): Promise<T> =>
    request<T>(assignment, 'PATCH', path, body),
  delete: <T,>(assignment: Assignment, path: string): Promise<T> =>
    request<T>(assignment, 'DELETE', path),
};
