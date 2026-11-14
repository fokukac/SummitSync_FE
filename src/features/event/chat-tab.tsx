import { type Mutation, useInfiniteQuery, useMutation, useMutationState, useQueryClient } from '@tanstack/react-query';
import { randomUUID } from 'expo-crypto';
import { useRef, useState } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { api, ApiError, unwrap } from '@/api/client';
import { useAuth } from '@/auth/auth-context';
import { Button } from '@/components/form';
import { Icon, IconButton } from '@/components/icon';
import { QueryState } from '@/components/query-state';
import { ThemedText } from '@/components/themed-text';
import { familyFor } from '@/constants/themes';
import { ChatMessage } from '@/features/event/chat-message';
import { ChatPeople } from '@/features/event/chat-people';
import { MessageActions } from '@/features/event/message-actions';
import { jumpTarget, type Message, type MessagesPage, pendingOutgoing, peopleOf, startsBlock } from '@/features/event/messages-cache';
import { CHAT_SEND, messagesKey, type ChatSendVars } from '@/features/event/offline-mutations';
import { useLiveChat } from '@/features/event/use-live-chat';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { useShape, useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { formatShortDateTime } from '@/lib/format';
import { useAppTheme } from '@/theme/theme-provider';

const MAX_LENGTH = 2000;
const PEOPLE_WIDTH = 240;
/** Pages of older history the People arrows will pull in looking for a person's previous message. */
const MAX_OLDER_PAGES = 10;

/** Oldest first: pages arrive newest first and are chronological inside. */
const flatten = (data: { pages: MessagesPage[] } | undefined): Message[] => [...(data?.pages ?? [])].reverse().flatMap((page) => page.data);

export function ChatTab({ eventId, canPost, canModerate }: { eventId: number; canPost: boolean; canModerate: boolean }) {
  const { user } = useAuth();
  const { t, intlLocale } = useI18n();
  const theme = useTheme();
  const shape = useShape();
  const { body: bodyFont } = useAppTheme();
  const queryClient = useQueryClient();
  const wide = useBreakpoint() !== 'compact';
  const { height: windowHeight } = useWindowDimensions();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const queryKey = messagesKey(eventId);

  const [draft, setDraft] = useState('');
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [cursors, setCursors] = useState<Record<number, number>>({});
  const [highlightId, setHighlightId] = useState<number>();
  const highlightTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Scrolling bookkeeping: where each message sits, how big the list is, and whether to follow new messages.
  const scroller = useRef<ScrollViewInstance>(null);
  const rows = useRef<Record<number, { y: number; height: number }>>({});
  const viewport = useRef({ height: 0, y: 0, content: 0 });
  const followNewest = useRef(true);
  const keepPosition = useRef<number>(null);

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

  const history = flatten(messages.data);
  const people = peopleOf(history);

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
    followNewest.current = true;
    sender.mutate({ eventId, clientId: randomUUID(), body });
  }

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    viewport.current = { height: layoutMeasurement.height, y: contentOffset.y, content: contentSize.height };
    followNewest.current = contentSize.height - contentOffset.y - layoutMeasurement.height < 80;
  }

  /** New messages keep the view at the bottom (if it was there); older ones loaded above must not move what is being read. */
  function onContentSizeChange(_width: number, height: number) {
    if (keepPosition.current !== null) {
      scroller.current?.scrollTo({ y: viewport.current.y + (height - keepPosition.current), animated: false });
      keepPosition.current = null;
    } else if (followNewest.current) {
      scroller.current?.scrollToEnd({ animated: false });
    }

    viewport.current.content = height;
  }

  async function loadOlder() {
    keepPosition.current = viewport.current.content;
    await messages.fetchNextPage();
  }

  function focusMessage(id: number) {
    setHighlightId(id);
    clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlightId(undefined), 1800);

    // The row may have only just been loaded and not measured yet.
    setTimeout(() => {
      const row = rows.current[id];

      if (row) {
        followNewest.current = false;
        scroller.current?.scrollTo({ y: Math.max(0, row.y - (viewport.current.height - row.height) / 2), animated: true });
      }
    }, 60);
  }

  /** Moves a person's arrows to their next or previous message and brings it into view; going back past the oldest loaded one pulls in older history first. */
  async function jump(userId: number, direction: 1 | -1) {
    let ids = peopleOf(history).find((person) => person.user.id === userId)?.ids ?? [];

    if (ids.length === 0) {
      return;
    }

    const current = cursors[userId];
    let target = jumpTarget(ids, current, direction, messages.hasNextPage);

    for (let pages = 0; target === -1 && pages < MAX_OLDER_PAGES; pages++) {
      keepPosition.current = viewport.current.content;
      const result = await messages.fetchNextPage();
      ids = peopleOf(flatten(result.data)).find((person) => person.user.id === userId)?.ids ?? ids;
      target = jumpTarget(ids, current, direction, result.hasNextPage);
    }

    const id = ids[target === -1 ? ids.length - 1 : target];
    setCursors((existing) => ({ ...existing, [userId]: id }));
    focusMessage(id);
  }

  const panelHeight = Math.max(360, Math.min(560, windowHeight - 300));

  const list = (
    <QueryState query={messages} empty={history.length === 0 && pending.length === 0} emptyText={t('chat.none')}>
      <ScrollView
        ref={scroller}
        style={{ height: panelHeight }}
        nestedScrollEnabled
        scrollEventThrottle={32}
        onScroll={onScroll}
        onLayout={(event) => (viewport.current.height = event.nativeEvent.layout.height)}
        onContentSizeChange={onContentSizeChange}
      >
        {messages.hasNextPage ? (
          <Button variant="plain" title={t('chat.loadOlder')} loading={messages.isFetchingNextPage} onPress={() => void loadOlder()} />
        ) : null}
        {history.map((message, index) => (
          <View key={message.id} onLayout={(event) => (rows.current[message.id] = { y: event.nativeEvent.layout.y, height: event.nativeEvent.layout.height })}>
            <ChatMessage
              name={message.user.name}
              avatar={message.user.avatar}
              time={formatShortDateTime(message.created_at, timezone, intlLocale)}
              body={message.body}
              header={startsBlock(message, history[index - 1])}
              own={message.user.id === user?.id}
              highlighted={highlightId === message.id}
              actions={<MessageActions eventId={eventId} message={message} own={message.user.id === user?.id} canModerate={canModerate} />}
            />
          </View>
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
      </ScrollView>
    </QueryState>
  );

  const composer = canPost ? (
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
    <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: 12 }}>
      {t('chat.onlyParticipants')}
    </ThemedText>
  );

  const peoplePanel = (
    <ChatPeople
      people={people}
      currentUserId={user?.id}
      cursors={cursors}
      onJump={(userId, direction) => void jump(userId, direction)}
      height={wide ? panelHeight : 240}
    />
  );

  if (wide) {
    // Beside the chat, as on the website: a column of people with arrows to step through each one's messages.
    return (
      <View style={{ flexDirection: 'row', gap: 20, alignItems: 'flex-start' }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          {list}
          {composer}
        </View>
        <View style={{ width: PEOPLE_WIDTH, borderLeftWidth: 1, borderLeftColor: theme.border }}>
          <ThemedText type="smallBold" style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
            {t('chat.people')}
          </ThemedText>
          {peoplePanel}
        </View>
      </View>
    );
  }

  // On a phone the people list folds away under the chat.
  return (
    <View style={{ gap: 8 }}>
      {list}
      {composer}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: peopleOpen }}
        onPress={() => setPeopleOpen((open) => !open)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }}
      >
        <ThemedText type="smallBold">
          {t('chat.people')} ({people.length})
        </ThemedText>
        <Icon name={peopleOpen ? 'up' : 'down'} size={20} color={theme.textSecondary} />
      </Pressable>
      {peopleOpen ? peoplePanel : null}
    </View>
  );
}
