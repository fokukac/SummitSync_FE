import { useEffect, useState } from 'react';

/** The API searches from 2 characters; anything shorter (or blank) is not a search yet. */
export function searchTerm(input: string): string | undefined {
  const term = input.trim();

  return term.length >= 2 ? term : undefined;
}

/** `value`, but only after it has stopped changing for `delay` ms: keeps a request from going out on every keystroke. */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
