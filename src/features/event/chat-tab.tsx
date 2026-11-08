import { type InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { randomUUID } from 'expo-crypto';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { api, ApiError, unwrap } from '@/api/client';
import { useAuth } from '@/auth/auth-context';
import { Button, ErrorText } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { Avatar, Card, QueryState } from '@/components/ui';
import { MessageActions } from '@/features/event/message-actions';
import { appendMessage, type Message, type MessagesPage } from '@/features/event/messages-cache';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { formatShortDateTime } from '@/lib/format';

type Outgoing = { clientId: string; body: string; failed: boolean };

const MAX_LENGTH = 2000;

export function ChatTab({ eventId, canPost, canModerate }: { eventId: number; canPost: boolean; canModerate: boolean }) {
  const { user } = useAuth();
  const { t, intlLocale } = useI18n();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const queryKey = ['event', eventId, 'messages'];

  const [draft, setDraft] = useState('');
  const [outgoing, setOutgoing] = useState<Outgoing[]>([]);
  const [error, setError] = useState<string>();

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
  const history = [...(messages.data?.pages ?? [])].reverse().flatMap((page) => page.data);

  async function deliver(item: Outgoing) {
    setError(undefined);
    setOutgoing((current) => current.map((entry) => (entry.clientId === item.clientId ? { ...entry, failed: false } : entry)));

    try {
      // The same client id on every attempt: the server stores the message once however often this is retried.
      const message = await unwrap(
        api.POST('/v1/events/{event}/messages', {
          params: { path: { event: eventId } },
          body: { body: item.body, client_id: item.clientId },
        }),
      );

      queryClient.setQueryData<InfiniteData<MessagesPage, number | undefined>>(queryKey, (data) => appendMessage(data, message as Message));
      setOutgoing((current) => current.filter((entry) => entry.clientId !== item.clientId));
    } catch (caught) {
      setOutgoing((current) => current.map((entry) => (entry.clientId === item.clientId ? { ...entry, failed: true } : entry)));
      setError(t(caught instanceof ApiError && caught.status === 429 ? 'chat.tooFast' : 'chat.sendFailed'));
    }
  }

  function send() {
    const body = draft.trim();

    if (body === '') {
      return;
    }

    setDraft('');
    const item = { clientId: randomUUID(), body, failed: false };
    setOutgoing((current) => [...current, item]);
    void deliver(item);
  }

  return (
    <View style={{ gap: 8 }}>
      <QueryState query={messages} empty={history.length === 0 && outgoing.length === 0} emptyText={t('chat.none')}>
        <View style={{ gap: 8 }}>
          {messages.hasNextPage ? (
            <Button variant="plain" title={t('chat.loadOlder')} loading={messages.isFetchingNextPage} onPress={() => void messages.fetchNextPage()} />
          ) : null}
          {history.map((message) => (
            <Card key={message.id}>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <Avatar name={message.user.name} uri={message.user.avatar} size={32} />
                <View style={{ flex: 1 }}>
                  <ThemedText type="smallBold">
                    {message.user.name}{' '}
                    <ThemedText type="small" themeColor="textSecondary">
                      {formatShortDateTime(message.created_at, timezone, intlLocale)}
                    </ThemedText>
                  </ThemedText>
                  <ThemedText>{message.body}</ThemedText>
                </View>
                <MessageActions eventId={eventId} message={message} own={message.user.id === user?.id} canModerate={canModerate} />
              </View>
            </Card>
          ))}
          {outgoing.map((item) => (
            <Card key={item.clientId}>
              <ThemedText themeColor="textSecondary">{item.body}</ThemedText>
              {item.failed ? (
                <Pressable accessibilityRole="button" onPress={() => void deliver(item)}>
                  <ThemedText type="smallBold" style={{ color: theme.danger }}>
                    {t('chat.sendFailed')} {t('common.tryAgain')}
                  </ThemedText>
                </Pressable>
              ) : null}
            </Card>
          ))}
        </View>
      </QueryState>

      {canPost ? (
        <View style={{ gap: 8 }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t('chat.placeholder')}
            placeholderTextColor={theme.textSecondary}
            accessibilityLabel={t('chat.placeholder')}
            multiline
            maxLength={MAX_LENGTH}
            style={{
              color: theme.text,
              borderColor: theme.border,
              backgroundColor: theme.backgroundElement,
              borderWidth: 1,
              borderRadius: 8,
              padding: 12,
              minHeight: 48,
              fontSize: 16,
            }}
          />
          {error ? <ErrorText>{error}</ErrorText> : null}
          <Button title={t('chat.send')} onPress={send} />
        </View>
      ) : (
        <ThemedText type="small" themeColor="textSecondary">
          {t('chat.onlyParticipants')}
        </ThemedText>
      )}
    </View>
  );
}
