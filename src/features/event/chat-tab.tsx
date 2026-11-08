import { useInfiniteQuery } from '@tanstack/react-query';
import { View } from 'react-native';

import { api, unwrap } from '@/api/client';
import { Button } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { Avatar, Card, QueryState } from '@/components/ui';
import { useI18n } from '@/i18n';
import { formatShortDateTime } from '@/lib/format';

/** History only for now; sending and the live Reverb channel come with the write-path and realtime phases. */
export function ChatTab({ eventId }: { eventId: number }) {
  const { t, intlLocale } = useI18n();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const messages = useInfiniteQuery({
    queryKey: ['event', eventId, 'messages'],
    initialPageParam: undefined as number | undefined,
    queryFn: ({ pageParam }) => unwrap(api.GET('/v1/events/{event}/messages', { params: { path: { event: eventId }, query: { before: pageParam } } })),
    // Pages arrive newest first and are chronological inside; the oldest message of a page is the cursor for the next.
    getNextPageParam: (last) => (last.has_more ? last.data[0]?.id : undefined),
  });

  // Oldest at the top: older pages go in front of newer ones.
  const ordered = [...(messages.data?.pages ?? [])].reverse().flatMap((page) => page.data);

  return (
    <QueryState query={messages} empty={ordered.length === 0} emptyText={t('chat.none')}>
      <View style={{ gap: 8 }}>
        {messages.hasNextPage ? <Button variant="plain" title={t('chat.loadOlder')} loading={messages.isFetchingNextPage} onPress={() => void messages.fetchNextPage()} /> : null}
        {ordered.map((message) => (
          <Card key={message.id}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
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
            </View>
          </Card>
        ))}
      </View>
    </QueryState>
  );
}
