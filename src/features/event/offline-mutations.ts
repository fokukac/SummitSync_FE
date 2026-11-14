import type { InfiniteData, QueryClient } from '@tanstack/react-query';

import { api, ApiError, unwrap } from '@/api/client';
import { appendMessage, type Message, type MessagesPage } from '@/features/event/messages-cache';

/**
 * Writes that work offline: chat messages and ticking checklist items. They wait in the mutation cache while there is
 * no connection, are saved to the device (see query-client.ts) and replay in order when the app is back online. Both are
 * safe to replay: a message carries a client id the server de-duplicates on, and a tick sets an absolute state.
 *
 * The functions live here, keyed, rather than inside components because a queued write that survives an app restart has
 * no component any more: TanStack Query looks its function up by key.
 */
export const CHAT_SEND = ['chat', 'send'] as const;
export const CHECKLIST_TOGGLE = ['checklist', 'toggle'] as const;

export type ChatSendVars = { eventId: number; clientId: string; body: string };
export type ChecklistToggleVars = { eventId: number; itemId: number; checked: boolean };

export type ChecklistItem = {
  id: number;
  label: string;
  sort_order: number;
  my_checked: boolean;
  checked_count: number;
  total_participants: number;
};

export const checklistKey = (eventId: number) => ['event', eventId, 'checklist'];
export const messagesKey = (eventId: number) => ['event', eventId, 'messages'];

/** Sets one item's state and moves its count, but only when the state actually changes (so replaying it cannot double-count). */
export function applyToggle(items: ChecklistItem[] | undefined, itemId: number, checked: boolean): ChecklistItem[] | undefined {
  return items?.map((item) =>
    item.id === itemId && item.my_checked !== checked ? { ...item, my_checked: checked, checked_count: item.checked_count + (checked ? 1 : -1) } : item,
  );
}

/** Client errors (validation, permission, gone) will not get better by trying again; network and server errors might. */
const shouldRetry = (failures: number, error: unknown) => failures < 3 && !(error instanceof ApiError && error.status >= 400 && error.status < 500);

const WEEK = 7 * 24 * 60 * 60 * 1000;

/** `gcTime`: how long a finished or waiting write is kept in memory (a week, so one saved on the device is not dropped). */
export function registerOfflineMutations(client: QueryClient, { gcTime = WEEK }: { gcTime?: number } = {}): void {
  client.setMutationDefaults(CHAT_SEND, {
    networkMode: 'online',
    gcTime,
    retry: shouldRetry,
    mutationFn: ({ eventId, clientId, body }: ChatSendVars) =>
      unwrap(api.POST('/v1/events/{event}/messages', { params: { path: { event: eventId } }, body: { body, client_id: clientId } })),
    onSuccess: (message, { eventId }) => {
      client.setQueryData<InfiniteData<MessagesPage, number | undefined>>(messagesKey(eventId), (data) => appendMessage(data, message as Message));
    },
  });

  client.setMutationDefaults(CHECKLIST_TOGGLE, {
    networkMode: 'online',
    gcTime,
    retry: shouldRetry,
    mutationFn: ({ eventId, itemId, checked }: ChecklistToggleVars) =>
      unwrap(
        api.PUT('/v1/events/{event}/checklist/{checklistItem}/state', {
          params: { path: { event: eventId, checklistItem: itemId } },
          body: { is_checked: checked },
        }),
      ),

    // Optimistic: the box flips and the count follows at once, whether or not there is a connection.
    onMutate: async ({ eventId, itemId, checked }: ChecklistToggleVars) => {
      await client.cancelQueries({ queryKey: checklistKey(eventId) });
      client.setQueryData<ChecklistItem[]>(checklistKey(eventId), (items) => applyToggle(items, itemId, checked));
    },
    onSuccess: (saved, { eventId }) => {
      client.setQueryData<ChecklistItem[]>(checklistKey(eventId), (items) => items?.map((item) => (item.id === saved.id ? saved : item)));
    },
    // A rejected tick (removed from the event, say): the server's list is the truth, so fetch it again.
    onError: (_error: unknown, { eventId }: ChecklistToggleVars) => client.invalidateQueries({ queryKey: checklistKey(eventId) }),
  });
}
