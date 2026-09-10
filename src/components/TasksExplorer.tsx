import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Assignment } from '../lib/api';
import type { Paginated, Task, TaskStatus } from '../lib/types';
import { TASK_STATUSES } from '../lib/types';
import { useAction } from '../lib/hooks';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Select,
  Spinner,
  TextInput,
  statusTone,
} from './ui';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskFormModal } from './TaskFormModal';

interface Filters {
  status: TaskStatus | '';
  projectId: string;
  assigneeId: string;
}

const emptyFilters: Filters = { status: '', projectId: '', assigneeId: '' };

export function TasksExplorer({ assignment }: { assignment: Assignment }) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [result, setResult] = useState<Paginated<Task> | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.projectId) params.set('projectId', filters.projectId);
    if (filters.assigneeId) params.set('assigneeId', filters.assigneeId);
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    setResult(await api.get<Paginated<Task>>(assignment, `/tasks?${params.toString()}`));
  }, [assignment, filters, page, pageSize]);

  const { run: refresh, loading, error } = useAction(load);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const totalPages = result ? Math.max(1, Math.ceil(result.total / pageSize)) : 1;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-end gap-3 border-b border-zinc-100 bg-zinc-50/60 px-5 py-4">
        <div className="w-32">
          <Field label="status">
            <Select
              value={filters.status}
              onChange={(e) => {
                setPage(1);
                setFilters((f) => ({ ...f, status: e.target.value as TaskStatus | '' }));
              }}
            >
              <option value="">any</option>
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="w-24">
          <Field label="projectId">
            <TextInput
              inputMode="numeric"
              placeholder="any"
              value={filters.projectId}
              onChange={(e) => {
                setPage(1);
                setFilters((f) => ({ ...f, projectId: e.target.value.replace(/\D/g, '') }));
              }}
            />
          </Field>
        </div>
        <div className="w-24">
          <Field label="assigneeId">
            <TextInput
              inputMode="numeric"
              placeholder="any"
              value={filters.assigneeId}
              onChange={(e) => {
                setPage(1);
                setFilters((f) => ({ ...f, assigneeId: e.target.value.replace(/\D/g, '') }));
              }}
            />
          </Field>
        </div>
        <div className="w-20">
          <Field label="pageSize">
            <Select
              value={pageSize}
              onChange={(e) => {
                setPage(1);
                setPageSize(Number(e.target.value));
              }}
            >
              {[5, 10, 20].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => refresh()}>
            Reload
          </Button>
          <Button size="sm" onClick={() => setCreating(true)}>
            + New task
          </Button>
        </div>
      </div>

      {error && (
        <p className="border-b border-rose-100 bg-rose-50 px-5 py-2 text-xs font-medium text-rose-700">
          {error}
        </p>
      )}

      {loading && !result ? (
        <div className="flex justify-center py-14">
          <Spinner className="size-6 text-zinc-300" />
        </div>
      ) : result && result.items.length > 0 ? (
        <ul className="divide-y divide-zinc-100">
          {result.items.map((task) => (
            <li key={task.id}>
              <button
                onClick={() => setOpenId(task.id)}
                className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-indigo-50/40"
              >
                <span className="w-10 shrink-0 font-mono text-xs text-zinc-400">#{task.id}</span>
                <span className="flex-1 truncate text-sm font-medium text-zinc-800">
                  {task.title}
                </span>
                {typeof task.commentCount === 'number' && (
                  <Badge tone="sky">{task.commentCount} 💬</Badge>
                )}
                <Badge tone="indigo">P{task.priority}</Badge>
                <Badge tone={statusTone(task.status)}>{task.status}</Badge>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No tasks match"
          hint="Adjust the filters, or create one. Task creation needs a real projectId — seed data is loaded on the Assignment 3 tab."
        />
      )}

      {result && (
        <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3 text-xs text-zinc-500">
          <span>
            <span className="font-semibold text-zinc-700">{result.total}</span> total · page{' '}
            {result.page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </Button>
          </div>
        </div>
      )}

      {creating && (
        <TaskFormModal
          assignment={assignment}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            void refresh();
          }}
        />
      )}
      {openId !== null && (
        <TaskDetailModal
          assignment={assignment}
          taskId={openId}
          onClose={() => setOpenId(null)}
          onChanged={() => void refresh()}
        />
      )}
    </Card>
  );
}
