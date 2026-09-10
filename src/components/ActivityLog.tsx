import { useState } from 'react';
import { useActivityLog } from '../lib/activityLog';
import { Badge, JsonBlock, cn } from './ui';

const methodTone: Record<string, string> = {
  GET: 'text-sky-700 bg-sky-50 ring-sky-200',
  POST: 'text-emerald-700 bg-emerald-50 ring-emerald-200',
  PATCH: 'text-amber-700 bg-amber-50 ring-amber-200',
  DELETE: 'text-rose-700 bg-rose-50 ring-rose-200',
};

export function ActivityLog() {
  const entries = useActivityLog();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-900">Request log</h2>
        <span className="text-xs text-zinc-400">{entries.length} calls</span>
      </div>

      {entries.length === 0 ? (
        <p className="px-4 py-6 text-center text-xs text-zinc-400">
          Every request the UI makes shows up here — method, path, status, timing, and both bodies.
        </p>
      ) : (
        <ul className="flex-1 divide-y divide-zinc-100 overflow-y-auto">
          {entries.map((e) => {
            const isOpen = expanded === e.id;
            return (
              <li key={e.id}>
                <button
                  onClick={() => setExpanded(isOpen ? null : e.id)}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-zinc-50"
                >
                  <span
                    className={cn(
                      'w-14 shrink-0 rounded px-1 py-0.5 text-center text-[10px] font-semibold ring-1 ring-inset',
                      methodTone[e.method] ?? 'text-zinc-600 bg-zinc-50 ring-zinc-200',
                    )}
                  >
                    {e.method}
                  </span>
                  <span className="flex-1 truncate font-mono text-xs text-zinc-700">
                    <span className="text-zinc-400">{e.assignment}</span> {e.path}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 text-xs font-semibold tabular-nums',
                      e.ok ? 'text-emerald-600' : 'text-rose-600',
                    )}
                  >
                    {e.status}
                  </span>
                  <span className="w-12 shrink-0 text-right text-[10px] tabular-nums text-zinc-400">
                    {e.durationMs}ms
                  </span>
                </button>
                {isOpen && (
                  <div className="space-y-2 bg-zinc-50 px-4 pb-3 pt-1">
                    {e.requestBody !== undefined && (
                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                          Request body
                        </p>
                        <JsonBlock value={e.requestBody} />
                      </div>
                    )}
                    <div>
                      <p className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                        Response
                        <Badge tone={e.ok ? 'emerald' : 'rose'}>{e.status}</Badge>
                      </p>
                      <JsonBlock value={e.responseBody} />
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
