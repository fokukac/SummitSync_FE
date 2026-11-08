import type { InfiniteData } from '@tanstack/react-query';

import { appendMessage, removeMessage } from '@/features/event/messages-cache';

type Page = Parameters<typeof appendMessage>[0] extends InfiniteData<infer P, unknown> | undefined ? P : never;

const message = (id: number) => ({
  id,
  event_id: 1,
  client_id: null,
  body: `m${id}`,
  created_at: '2026-11-08T10:00:00Z',
  user: { id: 1, name: 'A', username: 'a', avatar: null },
});

const cache = (pages: Page[]): InfiniteData<Page, number | undefined> => ({ pages, pageParams: pages.map(() => undefined) });

describe('appendMessage', () => {
  it('adds the message at the end of the newest page', () => {
    const result = appendMessage(cache([{ data: [message(1), message(2)], has_more: true }, { data: [message(0)], has_more: false }]), message(3));

    expect(result?.pages[0].data.map((m) => m.id)).toEqual([1, 2, 3]);
    expect(result?.pages[1].data.map((m) => m.id)).toEqual([0]);
  });

  it('ignores a message that is already in any page, so retries and live delivery cannot duplicate it', () => {
    const data = cache([{ data: [message(2)], has_more: true }, { data: [message(1)], has_more: false }]);

    expect(appendMessage(data, message(1))).toBe(data);
  });

  it('leaves an empty cache alone', () => {
    expect(appendMessage(undefined, message(1))).toBeUndefined();
  });
});

describe('removeMessage', () => {
  it('drops the message from whichever page holds it', () => {
    const data = cache([{ data: [message(2), message(3)], has_more: true }, { data: [message(1)], has_more: false }]);

    const result = removeMessage(data, 1);

    expect(result?.pages[0].data.map((m) => m.id)).toEqual([2, 3]);
    expect(result?.pages[1].data).toEqual([]);
  });

  it('leaves an empty cache alone', () => {
    expect(removeMessage(undefined, 1)).toBeUndefined();
  });
});
