import type { PersistedClient } from '@tanstack/react-query-persist-client';

/**
 * How big the saved offline cache may get, in characters of JSON. Android's AsyncStorage stops accepting writes at
 * about 6 MB for everything the app stores, and the cache is one entry; accented text takes up to 3 bytes a
 * character in the database, so this stays well under half of that.
 */
export const MAX_CACHE_CHARS = 1_800_000;

type Dehydrated = PersistedClient['clientState']['queries'][number];

/** The chat history is the one thing that grows without bound: keep its newest page (pages are newest first), drop the rest. */
function trimMessages(query: Dehydrated): Dehydrated {
  const data = query.state.data as { pages?: unknown[]; pageParams?: unknown[] } | undefined;
  const isMessages = query.queryKey[0] === 'event' && query.queryKey[2] === 'messages';

  if (!isMessages || !data?.pages || data.pages.length <= 1) {
    return query;
  }

  return { ...query, state: { ...query.state, data: { pages: data.pages.slice(0, 1), pageParams: (data.pageParams ?? []).slice(0, 1) } } };
}

/**
 * Makes the saved cache fit `maxChars`, losing as little as possible, in this order: older chat pages, then whole
 * queries (least recently loaded first). Writes still waiting to be sent are never dropped (they are small, and they
 * are the user's own work); if even they do not fit, they are all that is saved.
 */
export function fitToLimit(client: PersistedClient, maxChars: number = MAX_CACHE_CHARS): PersistedClient {
  const size = (candidate: PersistedClient) => JSON.stringify(candidate).length;

  if (size(client) <= maxChars) {
    return client;
  }

  let current: PersistedClient = { ...client, clientState: { ...client.clientState, queries: client.clientState.queries.map(trimMessages) } };

  if (size(current) <= maxChars) {
    return current;
  }

  // Oldest first, so the loop below drops from the front.
  const queries = [...current.clientState.queries].sort((a, b) => a.state.dataUpdatedAt - b.state.dataUpdatedAt);

  while (queries.length > 0) {
    queries.shift();
    current = { ...current, clientState: { ...current.clientState, queries } };

    if (size(current) <= maxChars) {
      break;
    }
  }

  return current;
}
