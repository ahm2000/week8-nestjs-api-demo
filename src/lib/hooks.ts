import { useCallback, useEffect, useState } from 'react';
import { ApiError } from './api';

export function useServerStatus(check: () => Promise<unknown>) {
  const [state, setState] = useState<'checking' | 'online' | 'offline'>('checking');

  const ping = useCallback(() => {
    setState('checking');
    check()
      .then(() => setState('online'))
      .catch((err: unknown) => {
        // A 4xx still means the server answered — it's up.
        setState(err instanceof ApiError ? 'online' : 'offline');
      });
  }, [check]);

  useEffect(() => {
    ping();
    const id = setInterval(ping, 8000);
    return () => clearInterval(id);
  }, [ping]);

  return { state, recheck: ping };
}

export function useAction<Args extends unknown[]>(fn: (...args: Args) => Promise<void>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (...args: Args) => {
      setLoading(true);
      setError(null);
      try {
        await fn(...args);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    [fn],
  );

  return { run, loading, error, setError };
}
