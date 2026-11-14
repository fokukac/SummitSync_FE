import { dehydrate, hydrate, MutationObserver, onlineManager, QueryClient } from '@tanstack/react-query';

import { session } from '@/api/client';
import {
  applyToggle,
  CHAT_SEND,
  CHECKLIST_TOGGLE,
  checklistKey,
  messagesKey,
  registerOfflineMutations,
  type ChatSendVars,
  type ChecklistItem,
  type ChecklistToggleVars,
} from '@/features/event/offline-mutations';

const item = (over: Partial<ChecklistItem> = {}): ChecklistItem => ({
  id: 1,
  label: 'Helmet',
  sort_order: 1,
  my_checked: false,
  checked_count: 2,
  total_participants: 6,
  ...over,
});

describe('applyToggle', () => {
  it('ticks and moves the count', () => {
    expect(applyToggle([item()], 1, true)).toEqual([item({ my_checked: true, checked_count: 3 })]);
    expect(applyToggle([item({ my_checked: true, checked_count: 3 })], 1, false)).toEqual([item()]);
  });

  it('does nothing when the state already matches, so a replayed tick cannot double-count', () => {
    const ticked = [item({ my_checked: true, checked_count: 3 })];

    expect(applyToggle(ticked, 1, true)).toEqual(ticked);
  });

  it('leaves other items and a missing list alone', () => {
    expect(applyToggle([item({ id: 2 })], 1, true)).toEqual([item({ id: 2 })]);
    expect(applyToggle(undefined, 1, true)).toBeUndefined();
  });
});

describe('queued writes', () => {
  const fetchMock = jest.fn();
  const originalFetch = globalThis.fetch;
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  const message = {
    id: 9,
    event_id: 7,
    client_id: 'c-1',
    body: 'See you at 7',
    created_at: '2026-11-07T05:00:00Z',
    user: { id: 1, name: 'A', username: 'a', avatar: null },
  };

  const clients: QueryClient[] = [];

  function newClient() {
    const client = new QueryClient({ defaultOptions: { mutations: { networkMode: 'always' } } });
    clients.push(client);
    // The real week-long garbage-collection timer would keep Jest alive.
    registerOfflineMutations(client, { gcTime: 10 });

    return client;
  }

  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    session.token = 't';
  });

  afterEach(() => {
    onlineManager.setOnline(true);
    // Cached queries and mutations hold garbage-collection timers (a week long) that would keep Jest alive.
    clients.splice(0).forEach((client) => client.clear());
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
    session.token = null;
  });

  it('waits offline and sends once when the connection returns', async () => {
    fetchMock.mockResolvedValue(json(message));
    const client = newClient();
    client.setQueryData(messagesKey(7), { pages: [{ data: [], has_more: false }], pageParams: [undefined] });

    onlineManager.setOnline(false);
    const observer = new MutationObserver<unknown, Error, ChatSendVars>(client, { mutationKey: CHAT_SEND });
    void observer.mutate({ eventId: 7, clientId: 'c-1', body: 'See you at 7' }).catch(() => undefined);
    await Promise.resolve();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(observer.getCurrentResult().isPaused).toBe(true);

    onlineManager.setOnline(true);
    await client.resumePausedMutations();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const request = fetchMock.mock.calls[0][0] as Request;
    expect(request.method).toBe('POST');
    expect(await request.json()).toEqual({ body: 'See you at 7', client_id: 'c-1' });
    expect((client.getQueryData(messagesKey(7)) as { pages: { data: unknown[] }[] }).pages[0].data).toHaveLength(1);
  });

  it('survives a restart: a saved paused write is replayed by a fresh client', async () => {
    fetchMock.mockResolvedValue(json({ ...item({ my_checked: true, checked_count: 3 }) }));
    const before = newClient();
    before.setQueryData(checklistKey(7), [item()]);

    onlineManager.setOnline(false);
    const observer = new MutationObserver<unknown, Error, ChecklistToggleVars>(before, { mutationKey: CHECKLIST_TOGGLE, scope: { id: 'checklist-7' } });
    void observer.mutate({ eventId: 7, itemId: 1, checked: true }).catch(() => undefined);
    await new Promise((resolve) => setTimeout(resolve, 0));

    // The box flipped at once, offline.
    expect((before.getQueryData(checklistKey(7)) as ChecklistItem[])[0].my_checked).toBe(true);

    // What the persister writes to the device ...
    const saved = JSON.parse(JSON.stringify(dehydrate(before, { shouldDehydrateMutation: (mutation) => mutation.state.isPaused })));
    expect(saved.mutations).toHaveLength(1);

    // ... and what a new app launch does with it. The old process is gone, so its in-memory write must not resume too.
    before.clear();
    const after = newClient();
    hydrate(after, saved);
    onlineManager.setOnline(true);
    await after.resumePausedMutations();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect((fetchMock.mock.calls[0][0] as Request).url).toContain('/checklist/1/state');
  });

  it('does not retry a rejected write forever (client errors are final)', async () => {
    fetchMock.mockResolvedValue(json({ message: 'Forbidden' }, 403));
    const client = newClient();
    const observer = new MutationObserver<unknown, Error, ChatSendVars>(client, { mutationKey: CHAT_SEND });

    await expect(observer.mutate({ eventId: 7, clientId: 'c-2', body: 'x' })).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
