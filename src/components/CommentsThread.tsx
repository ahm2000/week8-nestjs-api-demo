import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Comment, Paginated } from '../lib/types';
import { useAction } from '../lib/hooks';
import { Button, Spinner, TextInput } from './ui';

const PAGE_SIZE = 5;

export function CommentsThread({
  taskId,
  onCountChange,
}: {
  taskId: number;
  onCountChange: () => void;
}) {
  const [data, setData] = useState<Paginated<Comment> | null>(null);
  const [page, setPage] = useState(1);
  const [body, setBody] = useState('');
  const [authorId, setAuthorId] = useState('');

  const load = useCallback(async () => {
    setData(
      await api.get<Paginated<Comment>>(
        'a3',
        `/tasks/${taskId}/comments?page=${page}&pageSize=${PAGE_SIZE}`,
      ),
    );
  }, [taskId, page]);

  const { run: refresh, loading, error } = useAction(load);
  const { run: post, loading: posting, error: postError } = useAction(async () => {
    await api.post('a3', `/tasks/${taskId}/comments`, {
      body,
      authorId: Number(authorId),
    });
    setBody('');
    setPage(1);
    await load();
    onCountChange();
  });

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="rounded-lg border border-zinc-200">
      <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2">
        <h5 className="text-xs font-semibold text-zinc-700">
          Comments {data ? `(${data.total})` : ''}
        </h5>
        <span className="font-mono text-[10px] text-zinc-400">
          GET /tasks/{taskId}/comments
        </span>
      </div>

      {loading && !data ? (
        <div className="flex justify-center py-6">
          <Spinner className="size-5 text-zinc-300" />
        </div>
      ) : data && data.items.length > 0 ? (
        <ul className="divide-y divide-zinc-100">
          {data.items.map((c) => (
            <li key={c.id} className="px-3 py-2">
              <p className="text-sm text-zinc-700">{c.body}</p>
              <p className="mt-0.5 text-[10px] text-zinc-400">
                #{c.id} · {new Date(c.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-3 py-4 text-center text-xs text-zinc-400">No comments yet.</p>
      )}

      {error && <p className="px-3 py-1 text-xs text-rose-600">{error}</p>}

      {data && data.total > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-zinc-100 px-3 py-1.5 text-[11px] text-zinc-500">
          <span>
            page {data.page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              className="rounded px-1.5 py-0.5 hover:bg-zinc-100 disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </button>
            <button
              className="rounded px-1.5 py-0.5 hover:bg-zinc-100 disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      <div className="flex items-end gap-2 border-t border-zinc-100 bg-zinc-50 p-3">
        <div className="flex-1">
          <TextInput
            placeholder="Add a comment…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <div className="w-24">
          <TextInput
            inputMode="numeric"
            placeholder="authorId"
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value.replace(/\D/g, ''))}
          />
        </div>
        <Button
          size="sm"
          loading={posting}
          disabled={!body.trim() || !authorId}
          onClick={() => post()}
        >
          Post
        </Button>
      </div>
      {postError && <p className="px-3 pb-2 text-xs text-rose-600">{postError}</p>}
    </div>
  );
}
