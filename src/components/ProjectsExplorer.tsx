import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';
import type { Project } from '../lib/types';
import { useAction } from '../lib/hooks';
import {
  Button,
  Card,
  EmptyState,
  Field,
  JsonBlock,
  Modal,
  Spinner,
  TextInput,
} from './ui';

export function ProjectsExplorer() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const load = useCallback(async () => {
    setProjects(await api.get<Project[]>('a3', '/projects'));
  }, []);
  const { run: refresh, loading, error } = useAction(load);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/60 px-5 py-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Projects</h3>
          <p className="text-xs text-zinc-500">
            Full CRUD. Create needs a real <code className="text-[11px]">ownerId</code> (a user id).
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => refresh()}>
            Reload
          </Button>
          <Button size="sm" onClick={() => setCreating(true)}>
            + New project
          </Button>
        </div>
      </div>

      {error && (
        <p className="border-b border-rose-100 bg-rose-50 px-5 py-2 text-xs font-medium text-rose-700">
          {error}
        </p>
      )}

      {loading && !projects ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6 text-zinc-300" />
        </div>
      ) : projects && projects.length > 0 ? (
        <ul className="divide-y divide-zinc-100">
          {projects.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-indigo-50/40"
            >
              <span className="w-10 shrink-0 font-mono text-xs text-zinc-400">#{p.id}</span>
              <span className="flex-1 truncate font-medium text-zinc-800">{p.name}</span>
              <span className="text-xs text-zinc-400">
                {new Date(p.createdAt).toLocaleDateString()}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setEditing(p)}>
                Edit
              </Button>
              <DeleteProjectButton project={p} onDeleted={() => void refresh()} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No projects yet" hint="Create one to hang tasks and comments off." />
      )}

      {creating && (
        <ProjectFormModal
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            void refresh();
          }}
        />
      )}
      {editing && (
        <ProjectFormModal
          project={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void refresh();
          }}
        />
      )}
    </Card>
  );
}

function DeleteProjectButton({
  project,
  onDeleted,
}: {
  project: Project;
  onDeleted: () => void;
}) {
  const [armed, setArmed] = useState(false);
  const { run, loading } = useAction(async () => {
    await api.delete('a3', `/projects/${project.id}`);
    onDeleted();
  });

  if (!armed) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setArmed(true)}>
        Delete
      </Button>
    );
  }
  return (
    <span className="flex items-center gap-1">
      <span className="text-[11px] text-rose-500">cascades!</span>
      <Button variant="danger" size="sm" loading={loading} onClick={() => run()}>
        Confirm
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setArmed(false)}>
        ✕
      </Button>
    </span>
  );
}

function ProjectFormModal({
  project,
  onClose,
  onSaved,
}: {
  project?: Project;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = Boolean(project);
  const [name, setName] = useState(project?.name ?? '');
  const [ownerId, setOwnerId] = useState(project?.owner ? String(project.owner.id) : '');
  const [created, setCreated] = useState<Project | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const { run, loading, error } = useAction(async () => {
    setFieldError(null);
    if (name.trim().length === 0) {
      setFieldError('name should not be empty');
      throw new Error('Fix the highlighted field.');
    }
    const payload: Record<string, unknown> = { name };
    if (!editing || ownerId) payload.ownerId = Number(ownerId);

    try {
      if (editing && project) {
        setCreated(await api.patch<Project>('a3', `/projects/${project.id}`, payload));
      } else {
        setCreated(await api.post<Project>('a3', '/projects', payload));
      }
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        const body = err.body as { message?: unknown };
        const msg = Array.isArray(body?.message) ? (body.message as string[])[0] : undefined;
        if (msg) setFieldError(msg);
      }
      throw err;
    }
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? `Edit project #${project?.id}` : 'Create project'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={loading} onClick={() => run()}>
            {editing ? 'Save' : 'Create'}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Field label="name" error={fieldError ?? undefined}>
          <TextInput value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="ownerId" hint={editing ? 'leave to keep' : 'required — a user id'}>
          <TextInput
            inputMode="numeric"
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value.replace(/\D/g, ''))}
          />
        </Field>
        {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
        {created && (
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
              Response
            </p>
            <JsonBlock value={created} />
          </div>
        )}
      </div>
    </Modal>
  );
}
