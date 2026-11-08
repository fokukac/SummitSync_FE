import { type InfiniteData, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { useBlocked } from '@/features/blocks';
import { appendMessage, type Message, type MessagesPage } from '@/features/event/messages-cache';
import { getPusher } from '@/lib/realtime';

/**
 * Live messages for an event (private Reverb channel `event.{id}`, authorized by the API with the bearer token).
 * A new message is added to the cached history unless its author is blocked: the channel is shared by everyone in
 * the event, so hiding blocked people's live messages is the app's job (the server filters history).
 * After a dropped connection or coming back to the foreground, history is refetched to catch up on what was missed.
 */
export function useLiveChat(eventId: number, enabled: boolean): void {
  const queryClient = useQueryClient();
  const blocked = useBlocked();
  const blockedIds = useRef(new Set<number>());

  useEffect(() => {
    blockedIds.current = new Set((blocked.data ?? []).map((person) => person.id));
  }, [blocked.data]);

  useEffect(() => {
    const pusher = enabled ? getPusher() : null;

    if (!pusher) {
      return;
    }

    const queryKey = ['event', eventId, 'messages'];
    const catchUp = () => void queryClient.invalidateQueries({ queryKey });
    const channel = pusher.subscribe(`private-event.${eventId}`);

    const onMessage = (message: Message) => {
      if (!blockedIds.current.has(message.user.id)) {
        queryClient.setQueryData<InfiniteData<MessagesPage, number | undefined>>(queryKey, (data) => appendMessage(data, message));
      }
    };

    // The first connection loads history anyway; every later (re)connect may have missed messages.
    let connectedBefore = pusher.connection.state === 'connected';
    const onState = ({ current }: { current: string }) => {
      if (current === 'connected') {
        if (connectedBefore) {
          catchUp();
        }

        connectedBefore = true;
      }
    };

    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        pusher.connect();
        catchUp();
      }
    });

    channel.bind('message.posted', onMessage);
    pusher.connection.bind('state_change', onState);

    return () => {
      channel.unbind('message.posted', onMessage);
      pusher.connection.unbind('state_change', onState);
      pusher.unsubscribe(`private-event.${eventId}`);
      appState.remove();
    };
  }, [eventId, enabled, queryClient]);
}
