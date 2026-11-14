import { type Mutation, useInfiniteQuery, useMutation, useMutationState, useQueryClient } from '@tanstack/react-query';
import { randomUUID } from 'expo-crypto';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { api, ApiError, unwrap } from '@/api/client';
import { useAuth } from '@/auth/auth-context';
import { Button } from '@/components/form';
import { IconButton } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { QueryState } from '@/components/query-state';
import { ChatMessage } from '@/features/event/chat-message';
import { MessageActions } from '@/features/event/message-actions';
import { useLiveChat } from '@/features/event/use-live-chat';
import { pendingOutgoing, startsBlock } from '@/features/event/messages-cache';
import { CHAT_SEND, messagesKey, type ChatSendVars } from '@/features/event/offline-mutations';
import { useShape, useTheme } from '@/hooks/use-theme';
import { useAppTheme } from '@/theme/theme-provider';
import { familyFor } from '@/constants/themes';
import { useI18n } from '@/i18n';
import { formatShortDateTime } from '@/lib/format';

const MAX_LENGTH = 2000;

export function ChatTab({ eventId, canPost, canModerate }: { eventId: number; canPost: boolean; canModerate: boolean }) {
  const { user } = useAuth();
  const { t, intlLocale } = useI18n();
  const theme = useTheme();
  const shape = useShape();
  const { body: bodyFont } = useAppTheme();
  const queryClient = useQueryClient();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const queryKey = messagesKey(eventId);

  const [draft, setDraft] = useState('');

  const messages = useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as number | undefined,
    queryFn: ({ pageParam }) =>
      unwrap(
        api.GET('/v1/events/{event}/messages', {
          params: { path: { event: eventId }, query: { before: pageParam } },
        }),
      ),
    // Pages arrive newest first and are chronological inside; the oldest message of a page is the cursor for the next.
    getNextPageParam: (last) => (last.has_more ? last.data[0]?.id : undefined),
  });

  // Oldest at the top: older pages go in front of newer ones.
  useLiveChat(eventId, true);

  const history = [...(messages.data?.pages ?? [])].reverse().flatMap((page) => page.data);

  // Sent through the keyed mutation (offline-mutations.ts): with no connection it waits, survives a restart and is sent
  // when the app is back online. The same client id on every attempt means the server stores it once however often.
  const sender = useMutation<unknown, Error, ChatSendVars>({ mutationKey: CHAT_SEND, scope: { id: `chat-${eventId}` } });
  const queued = useMutationState({
    filters: {
      mutationKey: CHAT_SEND,
      predicate: (mutation) => (mutation.state.variables as ChatSendVars).eventId === eventId && mutation.state.status !== 'success',
    },
    select: (mutation) => mutation as Mutation<unknown, Error, ChatSendVars>,
  });
  const outgoing = queued.map((mutation) => ({
    clientId: mutation.state.variables!.clientId,
    body: mutation.state.variables!.body,
    failed: mutation.state.status === 'error',
    waiting: mutation.state.isPaused,
    tooFast: mutation.state.error instanceof ApiError && mutation.state.error.status === 429,
    mutation,
  }));

  // A message can come back over the live channel before its send request returns: show it once.
  const pending = pendingOutgoing(outgoing, history);

  function retry(item: (typeof outgoing)[number]) {
    queryClient.getMutationCache().remove(item.mutation);
    sender.mutate(item.mutation.state.variables!);
  }

  function send() {
    const body = draft.trim();

    if (body === '') {
      return;
    }

    setDraft('');
    sender.mutate({ eventId, clientId: randomUUID(), body });
  }

  return (
    <View style={{ gap: 8 }}>
      <QueryState query={messages} empty={history.length === 0 && pending.length === 0} emptyText={t('chat.none')}>
        <View style={{ gap: 8 }}>
          {messages.hasNextPage ? (
            <Button variant="plain" title={t('chat.loadOlder')} loading={messages.isFetchingNextPage} onPress={() => void messages.fetchNextPage()} />
          ) : null}
          {history.map((message, index) => (
            <ChatMessage
              key={message.id}
              name={message.user.name}
              avatar={message.user.avatar}
              time={formatShortDateTime(message.created_at, timezone, intlLocale)}
              body={message.body}
              header={startsBlock(message, history[index - 1])}
              own={message.user.id === user?.id}
              actions={<MessageActions eventId={eventId} message={message} own={message.user.id === user?.id} canModerate={canModerate} />}
            />
          ))}
          {pending.map((item, index) => (
            <ChatMessage
              key={item.clientId}
              name={user?.name ?? ''}
              avatar={user?.avatar}
              body={item.body}
              header={index === 0 && (history.length === 0 || history[history.length - 1].user.id !== user?.id)}
              own
              sending={!item.failed}
              status={
                item.failed ? (
                  <Pressable accessibilityRole="button" onPress={() => retry(item)}>
                    <ThemedText type="smallBold" style={{ color: theme.danger }}>
                      {t(item.tooFast ? 'chat.tooFast' : 'chat.sendFailed')} {t('common.tryAgain')}
                    </ThemedText>
                  </Pressable>
                ) : item.waiting ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    {t('offline.queued')}
                  </ThemedText>
                ) : null
              }
            />
          ))}
        </View>
      </QueryState>

      {canPost ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 12 }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t('chat.placeholder')}
            placeholderTextColor={theme.textSecondary}
            accessibilityLabel={t('chat.placeholder')}
            multiline
            maxLength={MAX_LENGTH}
            style={{
              flex: 1,
              color: theme.text,
              borderColor: theme.border,
              backgroundColor: theme.backgroundElement,
              borderWidth: 1,
              borderRadius: shape.radius,
              fontFamily: familyFor(bodyFont, 500),
              paddingHorizontal: 14,
              paddingVertical: 12,
              minHeight: 48,
              maxHeight: 140,
              fontSize: 16,
            }}
          />
          <View style={{ opacity: draft.trim() === '' ? 0.4 : 1 }}>
            <IconButton name="send" label={t('chat.send')} filled onPress={send} />
          </View>
        </View>
      ) : (
        <ThemedText type="small" themeColor="textSecondary">
          {t('chat.onlyParticipants')}
        </ThemedText>
      )}
    </View>
  );
}
