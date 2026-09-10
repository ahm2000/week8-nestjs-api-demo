import { useSyncExternalStore } from 'react';

export interface LogEntry {
  id: string;
  assignment: 'a1' | 'a2' | 'a3';
  method: string;
  path: string;
  status: number | null;
  ok: boolean;
  requestBody?: unknown;
  responseBody: unknown;
  durationMs: number;
  timestamp: string;
}

let entries: LogEntry[] = [];
const listeners = new Set<() => void>();

export function addLogEntry(entry: LogEntry): void {
  entries = [entry, ...entries].slice(0, 60);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): LogEntry[] {
  return entries;
}

export function useActivityLog(): LogEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot);
}
