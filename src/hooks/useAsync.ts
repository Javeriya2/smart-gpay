import { useState, useCallback } from 'react';

export function useAsync<T, Args extends any[]>(asyncFunction: (...args: Args) => Promise<T>) {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: Args) => {
      setLoading(true);
      setError(null);
      try {
        const response = await asyncFunction(...args);
        setValue(response);
        setLoading(false);
        return response;
      } catch (err: any) {
        setError(err);
        setLoading(false);
        throw err;
      }
    },
    [asyncFunction]
  );

  return { execute, loading, value, error };
}
