import type { InfiniteData } from '@tanstack/react-query';

export type Message = {
  id: number;
  event_id: number;
  client_id: string | null;
  body: string;
  created_at: string;
  user: { id: number; name: string; username: string; avatar: string | null };
};
export type MessagesPage = { data: Message[]; has_more: boolean };
/** Adds a message to the newest page unless it is already there (a retry or, later, the live channel may deliver it too). */
export function appendMessage(data: InfiniteData<MessagesPage, number | undefined> | undefined, message: Message) {
  if (!data || data.pages.length === 0) {
    return data;
  }

  const known = data.pages.some((page) => page.data.some((existing) => existing.id === message.id));

  return known ? data : { ...data, pages: [{ ...data.pages[0], data: [...data.pages[0].data, message] }, ...data.pages.slice(1)] };
}

/** Removes a message from every cached page (after a moderator deleted it). */
export function removeMessage(data: InfiniteData<MessagesPage, number | undefined> | undefined, messageId: number) {
  if (!data) {
    return data;
  }

  return { ...data, pages: data.pages.map((page) => ({ ...page, data: page.data.filter((message) => message.id !== messageId) })) };
}

/**
 * Messages being sent that are not yet in the history. A message can arrive over the live channel before its
 * send request returns; the client id (echoed in the broadcast) tells us it is already shown.
 */
export function pendingOutgoing<T extends { clientId: string }>(outgoing: T[], history: Pick<Message, 'client_id'>[]): T[] {
  const delivered = new Set(history.map((message) => message.client_id).filter((id): id is string => id !== null));

  return outgoing.filter((item) => !delivered.has(item.clientId));
}

/** Messages from the same person this close together read as one block: the name and avatar are shown once. */
const GROUP_WINDOW_MS = 5 * 60 * 1000;

/** True when `message` starts a new block (a different sender than `previous`, or a long pause since it). */
export function startsBlock(message: Pick<Message, 'user' | 'created_at'>, previous: Pick<Message, 'user' | 'created_at'> | undefined): boolean {
  return (
    !previous || previous.user.id !== message.user.id || new Date(message.created_at).getTime() - new Date(previous.created_at).getTime() > GROUP_WINDOW_MS
  );
}

export type ChatPerson = { user: Message['user']; ids: number[]; last: string };

/** Everyone who wrote in these messages (oldest first), most recently active first, with their message ids in order. */
export function peopleOf(messages: Pick<Message, 'id' | 'user' | 'created_at'>[]): ChatPerson[] {
  const byUser = new Map<number, ChatPerson>();

  for (const message of messages) {
    const entry = byUser.get(message.user.id);

    if (entry) {
      entry.ids.push(message.id);
      entry.last = message.created_at;
    } else {
      byUser.set(message.user.id, { user: message.user, ids: [message.id], last: message.created_at });
    }
  }

  return [...byUser.values()].sort((a, b) => b.last.localeCompare(a.last));
}

/**
 * Which of a person's messages their arrows move to. Forward starts at their oldest message and wraps; backward starts
 * at their newest and wraps. `current` is the message id the arrows are on now (undefined before the first press).
 * Returns the index into `ids`; `-1` means "at the oldest loaded message: load older history first, then ask again".
 */
export function jumpTarget(ids: number[], current: number | undefined, direction: 1 | -1, canLoadOlder: boolean): number {
  const at = current === undefined ? -1 : ids.indexOf(current);

  if (direction === 1) {
    return at === -1 ? 0 : (at + 1) % ids.length;
  }

  if (at === -1) {
    return ids.length - 1;
  }

  if (at === 0) {
    return canLoadOlder ? -1 : ids.length - 1;
  }

  return at - 1;
}
