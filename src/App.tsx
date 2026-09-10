import { useEffect, useState } from 'react';
import { Assignment1Panel } from './panels/Assignment1Panel';
import { Assignment2Panel } from './panels/Assignment2Panel';
import { Assignment3Panel } from './panels/Assignment3Panel';
import { ActivityLog } from './components/ActivityLog';
import { isMockMode } from './lib/mockApi';
import { cn } from './components/ui';

type TabId = 'a1' | 'a2' | 'a3';

const tabs: { id: TabId; num: string; label: string }[] = [
  { id: 'a1', num: '01', label: 'Fundamentals' },
  { id: 'a2', num: '02', label: 'Tasks API' },
  { id: 'a3', num: '03', label: 'Projects & Comments' },
];

function readHash(): TabId {
  const h = window.location.hash.replace('#', '');
  return h === 'a1' || h === 'a2' || h === 'a3' ? h : 'a3';
}

const mock = isMockMode();

export default function App() {
  const [tab, setTab] = useState<TabId>(readHash);

  useEffect(() => {
    const onHash = () => setTab(readHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const selectTab = (id: TabId) => {
    window.location.hash = id;
    setTab(id);
  };

  return (
    <div className="mx-auto flex min-h-svh max-w-[1400px] flex-col px-4 py-6 sm:px-8 lg:flex-row lg:gap-8">
      <main className="min-w-0 flex-1">
        <header className="mb-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              W8
            </div>
            <div>
              <h1 className="text-base font-semibold text-zinc-900">Week 8 · NestJS API</h1>
              <p className="text-xs text-zinc-500">
                Demo of the Task Management API — three assignments, one data model.
              </p>
            </div>
            {mock && (
              <span
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200"
                title="This deployed build talks to an in-browser mock that reproduces the same routes, status codes, errors and pagination. The real NestJS API runs locally against Postgres — see the repo README."
              >
                <span className="size-1.5 rounded-full bg-amber-500" />
                Mock backend
              </span>
            )}
          </div>

          <nav className="mt-5 flex gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-zinc-200">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTab(t.id)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  tab === t.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800',
                )}
              >
                <span
                  className={cn(
                    'font-mono text-xs',
                    tab === t.id ? 'text-indigo-200' : 'text-zinc-400',
                  )}
                >
                  {t.num}
                </span>
                {t.label}
              </button>
            ))}
          </nav>
        </header>

        {tab === 'a1' && <Assignment1Panel />}
        {tab === 'a2' && <Assignment2Panel />}
        {tab === 'a3' && <Assignment3Panel />}

        <footer className="mt-10 border-t border-zinc-200 pt-4 text-xs text-zinc-400">
          {mock ? (
            <>
              This deployed build uses an in-browser mock backend. Run the real NestJS servers
              locally (ports <code className="text-zinc-500">3001 / 3002 / 3003</code>) and open this
              on <code className="text-zinc-500">localhost</code> to hit Postgres for real — see the
              README.
            </>
          ) : (
            <>
              Requests are proxied by the Vite dev server to{' '}
              <code className="text-zinc-500">localhost:3001 / 3002 / 3003</code>. Start each
              assignment with <code className="text-zinc-500">npm run start</code> in its folder.
            </>
          )}
        </footer>
      </main>

      <aside className="mt-8 w-full shrink-0 lg:mt-0 lg:w-[380px]">
        <div className="sticky top-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 lg:h-[calc(100svh-3rem)]">
          <ActivityLog />
        </div>
      </aside>
    </div>
  );
}
