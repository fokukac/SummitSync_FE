import { useState } from 'react';

import { errorMessage, validationErrors } from '@/api/client';

/**
 * Shared state for a form that calls the API: a busy flag, per-field validation errors and a general message.
 * `run` takes the request and returns whether it succeeded (a 2xx); anything else fills `errors`/`message`.
 */
export function useFormState() {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string>();

  async function run<T extends { error?: unknown; response: Response }>(request: PromiseLike<T>): Promise<T | undefined> {
    setBusy(true);
    setErrors({});
    setMessage(undefined);

    try {
      const result = await request;

      if (!result.response.ok) {
        const fields = validationErrors(result.error);
        setErrors(fields);
        setMessage(Object.keys(fields).length === 0 ? errorMessage(result.error) ?? '' : undefined);

        return undefined;
      }

      return result;
    } catch {
      setMessage('');

      return undefined;
    } finally {
      setBusy(false);
    }
  }

  return { busy, errors, message, run, reset: () => (setErrors({}), setMessage(undefined)) };
}
