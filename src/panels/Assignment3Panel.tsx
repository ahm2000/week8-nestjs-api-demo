import { useCallback } from 'react';
import { api } from '../lib/api';
import { useServerStatus } from '../lib/hooks';
import { ProjectsExplorer } from '../components/ProjectsExplorer';
import { TasksExplorer } from '../components/TasksExplorer';
import { Card } from '../components/ui';
import { PanelHeading } from './Assignment1Panel';

export function Assignment3Panel() {
  const check = useCallback(() => api.get('a3', '/projects'), []);
  const { state } = useServerStatus(check);

  return (
    <div className="space-y-5">
      <PanelHeading
        state={state}
        port={3003}
        title="Projects & Comments"
        blurb="Projects CRUD, task-scoped comments (POST / GET /tasks/:id/comments), a comment count on the task read, and a project delete that cascades through the database."
      />

      <Card className="bg-indigo-50/50 px-5 py-3 ring-indigo-100">
        <p className="text-xs text-indigo-900/80">
          <span className="font-semibold">Seed data:</span> users{' '}
          <code className="rounded bg-white/70 px-1">1</code>–
          <code className="rounded bg-white/70 px-1">6</code> exist (Margaret, Alan, Ada, Grace,
          Katherine, Linus). Use one of those ids for <code>ownerId</code>, <code>assigneeId</code>,
          and <code>authorId</code>. Projects and tasks you create show up below.
        </p>
      </Card>

      <ProjectsExplorer />
      <TasksExplorer assignment="a3" />
    </div>
  );
}
