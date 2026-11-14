import { ApiError } from '@/api/client';

/**
 * What kind of failure a query ended in, for choosing what to show:
 * - `notFound` (404): gone or never existed, trying again will not help;
 * - `forbidden` (403): it exists but this person may not see it, trying again will not help either;
 * - `failed`: anything else (server error, no connection), where trying again might.
 */
export type QueryFailure = 'notFound' | 'forbidden' | 'failed';

export function queryFailure(error: unknown): QueryFailure {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return 'notFound';
    }

    if (error.status === 403) {
      return 'forbidden';
    }
  }

  return 'failed';
}
