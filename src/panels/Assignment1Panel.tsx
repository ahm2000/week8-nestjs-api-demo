import { useCallback, useState } from 'react';
import { api } from '../lib/api';
import type { DbHealth, PingPong } from '../lib/types';
import { useAction, useServerStatus } from '../lib/hooks';
import { isMockMode } from '../lib/mockApi';
import { Badge, Button, Card, CardHeader, StatusDot } from '../components/ui';

export function Assignment1Panel() {
  const check = useCallback(() => api.get('a1', '/health/db'), []);
  const { state } = useServerStatus(check);

  return (
    <div className="space-y-5">
      <PanelHeading
        state={state}
        port={3001}
        title="Fundamentals drills"
        blurb="One feature module wired controller → service → repository, plus a second injected provider. Two read endpoints, no request bodies."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <DbHealthCard />
        <PingPongCard />
      </div>
    </div>
  );
}

export function PanelHeading({
  state,
  port,
  title,
  blurb,
}: {
  state: 'checking' | 'online' | 'offline';
  port: number;
  title: string;
  blurb: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="max-w-xl">
        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{blurb}</p>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200">
        <StatusDot state={state} />
        {state === 'online' ? 'Connected' : state === 'offline' ? 'Server offline' : 'Checking…'}
        <span className="text-zinc-300">·</span>
        <span className="font-mono text-zinc-400">
          {isMockMode() ? 'mock backend' : `localhost:${port}`}
        </span>
      </div>
    </div>
  );
}

function DbHealthCard() {
  const [data, setData] = useState<DbHealth | null>(null);
  const { run, loading, error } = useAction(async () => {
    setData(await api.get<DbHealth>('a1', '/health/db'));
  });

  return (
    <Card>
      <CardHeader
        title="GET /health/db"
        subtitle="Counts rows in the tasks table through the full three-layer path."
      />
      <div className="p-5">
        {data ? (
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-semibold tabular-nums text-zinc-900">{data.count}</p>
              <p className="mt-1 text-xs text-zinc-500">rows in tasks</p>
            </div>
            <p className="text-right text-[11px] text-zinc-400">
              as of
              <br />
              {new Date(data.asOf).toLocaleTimeString()}
            </p>
          </div>
        ) : (
          <p className="text-sm text-zinc-400">Run the check to see the row count.</p>
        )}
        {error && <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>}
        <Button className="mt-4 w-full" variant="secondary" loading={loading} onClick={() => run()}>
          Check now
        </Button>
      </div>
    </Card>
  );
}

function PingPongCard() {
  const [data, setData] = useState<PingPong | null>(null);
  const { run, loading, error } = useAction(async () => {
    setData(await api.get<PingPong>('a1', '/ping'));
  });

  return (
    <Card>
      <CardHeader
        title="GET /ping"
        subtitle="PingService and PongService inject each other — the forwardRef drill."
      />
      <div className="p-5">
        {data ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge tone="sky">ping</Badge>
              <code className="text-xs text-zinc-600">{data.ping}</code>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="indigo">pong</Badge>
              <code className="text-xs text-zinc-600">{data.pong}</code>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-400">Each service calls into the other exactly once.</p>
        )}
        {error && <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>}
        <Button className="mt-4 w-full" variant="secondary" loading={loading} onClick={() => run()}>
          Send ping
        </Button>
      </div>
    </Card>
  );
}
