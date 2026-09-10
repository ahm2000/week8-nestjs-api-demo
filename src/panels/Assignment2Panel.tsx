import { useCallback } from 'react';
import { api } from '../lib/api';
import { useServerStatus } from '../lib/hooks';
import { TasksExplorer } from '../components/TasksExplorer';
import { PanelHeading } from './Assignment1Panel';

export function Assignment2Panel() {
  const check = useCallback(() => api.get('a2', '/tasks?pageSize=1'), []);
  const { state } = useServerStatus(check);

  return (
    <div className="space-y-5">
      <PanelHeading
        state={state}
        port={3002}
        title="Tasks API — full CRUD"
        blurb="POST / GET (with combinable filters + pagination) / GET :id / PATCH / DELETE, a global ValidationPipe, and one error shape for every failure."
      />
      <TasksExplorer assignment="a2" />
    </div>
  );
}
