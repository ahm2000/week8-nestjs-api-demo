import { useState } from 'react';
import { api, ApiError } from '../lib/api';
import type { Assignment } from '../lib/api';
import type { Task, TaskStatus } from '../lib/types';
import { TASK_STATUSES } from '../lib/types';
import { useAction } from '../lib/hooks';
import { Button, Field, Modal, Select, TextInput, Textarea } from './ui';

interface Props {
  assignment: Assignment;
  task?: Task;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  title: string;
  description: string;
  status: TaskStatus;
  priority: string;
  projectId: string;
  assigneeId: string;
  tagIds: string;
}

function initialState(task?: Task): FormState {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: task?.status ?? 'todo',
    priority: String(task?.priority ?? 3),
    projectId: task?.project ? String(task.project.id) : '',
    assigneeId: task?.assignee ? String(task.assignee.id) : '',
    tagIds: task?.tags?.map((t) => t.id).join(', ') ?? '',
  };
}

function parseFieldErrors(err: unknown): Record<string, string> {
  if (!(err instanceof ApiError) || err.status !== 400) return {};
  const body = err.body as { message?: unknown };
  const messages = Array.isArray(body?.message) ? (body.message as string[]) : [];
  const out: Record<string, string> = {};
  for (const m of messages) {
    const field = m.split(' ')[0];
    if (!out[field]) out[field] = m;
  }
  return out;
}

export function TaskFormModal({ assignment, task, onClose, onSaved }: Props) {
  const editing = Boolean(task);
  const [form, setForm] = useState<FormState>(() => initialState(task));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const clientErrors = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (form.title.trim().length < 3) e.title = 'title must be at least 3 characters';
    const p = Number(form.priority);
    if (!Number.isInteger(p) || p < 1 || p > 5) e.priority = 'priority must be an integer 1–5';
    if (!editing && !form.projectId) e.projectId = 'projectId is required';
    return e;
  };

  const { run, loading, error } = useAction(async () => {
    const local = clientErrors();
    if (Object.keys(local).length) {
      setFieldErrors(local);
      throw new Error('Fix the highlighted fields.');
    }
    setFieldErrors({});

    const tagIds = form.tagIds
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n > 0);

    const payload: Record<string, unknown> = {
      title: form.title,
      description: form.description || undefined,
      status: form.status,
      priority: Number(form.priority),
    };
    if (form.projectId) payload.projectId = Number(form.projectId);
    if (form.assigneeId) payload.assigneeId = Number(form.assigneeId);
    if (tagIds.length) payload.tagIds = tagIds;

    try {
      if (editing && task) {
        await api.patch(assignment, `/tasks/${task.id}`, payload);
      } else {
        await api.post(assignment, '/tasks', payload);
      }
      onSaved();
    } catch (err) {
      const parsed = parseFieldErrors(err);
      if (Object.keys(parsed).length) setFieldErrors(parsed);
      throw err;
    }
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? `Edit task #${task?.id}` : 'Create task'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={loading} onClick={() => run()}>
            {editing ? 'Save changes' : 'Create'}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Field label="title" error={fieldErrors.title}>
          <TextInput value={form.title} onChange={(e) => set('title', e.target.value)} />
        </Field>
        <Field label="description" hint="optional">
          <Textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="status">
            <Select
              value={form.status}
              onChange={(e) => set('status', e.target.value as TaskStatus)}
            >
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="priority" hint="1–5" error={fieldErrors.priority}>
            <Select value={form.priority} onChange={(e) => set('priority', e.target.value)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="projectId"
            hint={editing ? 'leave to keep' : 'required'}
            error={fieldErrors.projectId}
          >
            <TextInput
              inputMode="numeric"
              value={form.projectId}
              onChange={(e) => set('projectId', e.target.value.replace(/\D/g, ''))}
            />
          </Field>
          <Field label="assigneeId" hint="optional" error={fieldErrors.assigneeId}>
            <TextInput
              inputMode="numeric"
              value={form.assigneeId}
              onChange={(e) => set('assigneeId', e.target.value.replace(/\D/g, ''))}
            />
          </Field>
        </div>
        <Field label="tagIds" hint="comma-separated" error={fieldErrors.tagIds}>
          <TextInput
            placeholder="e.g. 1, 2"
            value={form.tagIds}
            onChange={(e) => set('tagIds', e.target.value)}
          />
        </Field>
        {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      </div>
    </Modal>
  );
}
