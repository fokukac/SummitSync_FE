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

