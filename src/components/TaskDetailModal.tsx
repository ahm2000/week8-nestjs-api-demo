import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Assignment } from '../lib/api';
import type { Task } from '../lib/types';
import { useAction } from '../lib/hooks';
import { Badge, Button, JsonBlock, Modal, Spinner, statusTone } from './ui';
import { TaskFormModal } from './TaskFormModal';
import { CommentsThread } from './CommentsThread';

interface Props {
  assignment: Assignment;
  taskId: number;
  onClose: () => void;
  onChanged: () => void;
}

export function TaskDetailModal({ assignment, taskId, onClose, onChanged }: Props) {
  const [task, setTask] = useState<Task | null>(null);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    setTask(await api.get<Task>(assignment, `/tasks/${taskId}`));
  }, [assignment, taskId]);

  const { run: refresh, loading, error } = useAction(load);
  const { run: doDelete, loading: deleting } = useAction(async () => {
    await api.delete(assignment, `/tasks/${taskId}`);
    onChanged();
    onClose();
  });

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <>
      <Modal
        open={!editing}
        onClose={onClose}
        title={`Task #${taskId}`}
        footer={
          <>
            {confirmDelete ? (
              <>
                <span className="mr-auto self-center text-xs text-zinc-500">Delete this task?</span>
                <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
                <Button variant="danger" loading={deleting} onClick={() => doDelete()}>
                  Delete
                </Button>
              </>
            ) : (
              <>
                <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                  Delete
                </Button>
                <Button variant="secondary" onClick={() => setEditing(true)} disabled={!task}>
                  Edit
                </Button>
                <Button onClick={onClose}>Done</Button>
              </>
            )}
          </>
        }
      >
        {loading && !task ? (
          <div className="flex justify-center py-10">
            <Spinner className="size-6 text-zinc-300" />
          </div>
        ) : error ? (
          <p className="text-sm font-medium text-rose-600">{error}</p>
        ) : task ? (
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <h4 className="text-base font-semibold text-zinc-900">{task.title}</h4>
                <Badge tone={statusTone(task.status)}>{task.status}</Badge>
                <Badge tone="indigo">P{task.priority}</Badge>
                {typeof task.commentCount === 'number' && (
                  <Badge tone="sky">{task.commentCount} 💬</Badge>
                )}
              </div>
              {task.description && <p className="text-sm text-zinc-600">{task.description}</p>}
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg bg-zinc-50 p-3 text-xs">
              <Row label="project">
                {task.project ? `#${task.project.id} · ${task.project.name}` : '—'}
              </Row>
              <Row label="assignee">{task.assignee ? task.assignee.name : 'unassigned'}</Row>
              <Row label="tags">
                {task.tags && task.tags.length ? task.tags.map((t) => t.name).join(', ') : '—'}
              </Row>
              <Row label="created">{new Date(task.createdAt).toLocaleString()}</Row>
            </dl>

            <details className="group">
              <summary className="cursor-pointer text-xs font-medium text-zinc-500 hover:text-zinc-700">
                Raw response
              </summary>
              <div className="mt-2">
                <JsonBlock value={task} />
              </div>
            </details>

            {assignment === 'a3' && (
              <CommentsThread taskId={taskId} onCountChange={() => void refresh()} />
            )}
          </div>
        ) : null}
      </Modal>

      {editing && task && (
        <TaskFormModal
          assignment={assignment}
          task={task}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            void refresh();
            onChanged();
          }}
        />
      )}
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-medium uppercase tracking-wide text-zinc-400">{label}</dt>
      <dd className="mt-0.5 text-zinc-700">{children}</dd>
    </div>
  );
}
