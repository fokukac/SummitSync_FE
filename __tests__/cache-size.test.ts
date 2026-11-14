import type { PersistedClient } from '@tanstack/react-query-persist-client';

import { fitToLimit } from '@/lib/cache-size';

type Query = PersistedClient['clientState']['queries'][number];

const query = (key: unknown[], data: unknown, dataUpdatedAt: number): Query =>
  ({ queryKey: key, queryHash: JSON.stringify(key), state: { data, dataUpdatedAt, status: 'success' } }) as unknown as Query;

const persisted = (queries: Query[], mutations: unknown[] = []): PersistedClient =>
  ({ timestamp: 1, buster: '1', clientState: { queries, mutations } }) as unknown as PersistedClient;

const text = (length: number) => 'x'.repeat(length);
const size = (client: PersistedClient) => JSON.stringify(client).length;

describe('fitToLimit', () => {
  it('leaves a small cache untouched', () => {
    const client = persisted([query(['group', 'a'], { name: 'A' }, 1)]);

    expect(fitToLimit(client, 10_000)).toBe(client);
  });

  it('first keeps only the newest page of a long chat history', () => {
    const pages = [{ data: [text(300)] }, { data: [text(3000)] }, { data: [text(3000)] }];
    const client = persisted([query(['event', 7, 'messages'], { pages, pageParams: [undefined, 5, 3] }, 1), query(['group', 'a'], { name: 'A' }, 2)]);

    const fitted = fitToLimit(client, 1500);
    const messages = fitted.clientState.queries.find((q) => q.queryKey[2] === 'messages');

    expect((messages?.state.data as { pages: unknown[]; pageParams: unknown[] }).pages).toEqual([pages[0]]);
    expect((messages?.state.data as { pageParams: unknown[] }).pageParams).toEqual([undefined]);
    expect(fitted.clientState.queries).toHaveLength(2);
  });

  it('then drops the least recently loaded queries until it fits', () => {
    const client = persisted([query(['a'], text(1000), 30), query(['b'], text(1000), 10), query(['c'], text(1000), 20)]);

    const fitted = fitToLimit(client, 2500);

    expect(fitted.clientState.queries.map((q) => q.queryKey[0]).sort()).toEqual(['a', 'c']);
    expect(size(fitted)).toBeLessThanOrEqual(2500);
  });

  it('never drops writes waiting to be sent', () => {
    const mutation = { mutationKey: ['chat', 'send'], state: { variables: { body: 'hi' }, isPaused: true } };
    const client = persisted([query(['a'], text(5000), 1)], [mutation]);

    const fitted = fitToLimit(client, 500);

    expect(fitted.clientState.queries).toHaveLength(0);
    expect(fitted.clientState.mutations).toHaveLength(1);
  });
});
