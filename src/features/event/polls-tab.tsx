import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { api, unwrap } from '@/api/client';
import { Avatar } from '@/components/avatar';
import { Badge } from '@/components/badge';
import { Button, ErrorText } from '@/components/form';
import { Icon } from '@/components/icon';
import { QueryState } from '@/components/query-state';
import { Radio } from '@/components/radio';
import { ThemedText } from '@/components/themed-text';
import { PollForm } from '@/features/event/poll-form';
import { useShape, useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { formatShortDateTime } from '@/lib/format';

type Poll = Awaited<ReturnType<typeof loadPolls>>[number];
type Option = Poll['options'][number];

async function loadPolls(eventId: number) {
  return (
    await unwrap(
      api.GET('/v1/events/{event}/polls', {
        params: { path: { event: eventId } },
      }),
    )
  ).data;
}

/** An option's share of the votes cast, in whole percent. */
const percentage = (poll: Poll, votes: number) => (poll.total_votes ? Math.round((votes / poll.total_votes) * 100) : 0);

/** Vote counts are absent from the payload when the viewer may not see results yet, so a poll never reveals more than the server allows. */
export function PollsTab({ eventId, canManage }: { eventId: number; canManage: boolean }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const polls = useQuery({
    queryKey: ['event', eventId, 'polls'],
    queryFn: () => loadPolls(eventId),
  });

  return (
    <View style={{ gap: 12 }}>
      {/* No heading: the tab already says "Polls". */}
      {canManage && !creating ? <Button compact title={t('polls.new')} onPress={() => setCreating(true)} /> : null}
      {creating ? (
        <PollForm
          eventId={eventId}
          onCancel={() => setCreating(false)}
          onCreated={(poll) => {
            queryClient.setQueryData<Poll[]>(['event', eventId, 'polls'], (existing) => [poll as Poll, ...(existing ?? [])]);
            setCreating(false);
          }}
        />
      ) : null}
      <QueryState query={polls} empty={polls.data?.length === 0} emptyText={t('polls.none')} emptyIcon="poll">
        {polls.data?.map((poll) => (
          <PollCard key={poll.id} eventId={eventId} poll={poll} canManage={canManage} />
        ))}
      </QueryState>
    </View>
  );
}

function PollCard({ eventId, poll, canManage }: { eventId: number; poll: Poll; canManage: boolean }) {
  const { t, intlLocale } = useI18n();
  const theme = useTheme();
  const queryClient = useQueryClient();
  // Closing is final, so the first press only asks ("Click again to close now"), as on the website.
  const [confirmClose, setConfirmClose] = useState(false);

  const replace = (updated: Poll) =>
    queryClient.setQueryData<Poll[]>(['event', eventId, 'polls'], (polls) => polls?.map((existing) => (existing.id === updated.id ? updated : existing)));

  const close = useMutation({
    mutationFn: () => unwrap(api.POST('/v1/events/{event}/polls/{poll}/close', { params: { path: { event: eventId, poll: poll.id } } })),
    onSuccess: replace,
  });
  const vote = useMutation({
    mutationFn: (optionId: number) =>
      unwrap(api.POST('/v1/events/{event}/polls/{poll}/vote', { params: { path: { event: eventId, poll: poll.id } }, body: { option_id: optionId } })),
    // The answer is this poll as the viewer may now see it (results can appear after voting).
    onSuccess: replace,
  });

  return (
    <View style={{ gap: 12, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border }}>
      <View style={{ gap: 6 }}>
        <ThemedText type="subtitle" style={{ fontSize: 20, lineHeight: 26 }}>
          {poll.title}
        </ThemedText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          <Badge label={t(poll.is_closed ? 'polls.closed' : 'polls.open')} variant={poll.is_closed ? 'secondary' : 'filled'} />
          <Badge label={t(poll.is_anonymous ? 'polls.anonymous' : 'polls.publicVotes')} variant="outline" icon={poll.is_anonymous ? 'eyeOff' : 'eye'} />
        </View>
        {poll.description ? (
          <ThemedText type="small" themeColor="textSecondary">
            {poll.description}
          </ThemedText>
        ) : null}
        {poll.closes_at && !poll.is_closed ? (
          <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
            {t('polls.closesAt', { date: formatShortDateTime(poll.closes_at, Intl.DateTimeFormat().resolvedOptions().timeZone, intlLocale) })}
          </ThemedText>
        ) : null}
      </View>

      <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
        {poll.options.map((option) => (
          <OptionRow key={option.id} poll={poll} option={option} busy={vote.isPending} onVote={() => vote.mutate(option.id)} />
        ))}
      </View>

      {vote.isError ? <ErrorText>{t('polls.voteFailed')}</ErrorText> : null}

      <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
        {poll.results_visible
          ? t('polls.votes', { count: poll.total_votes ?? 0 })
          : t(poll.visibility === 'after_vote' ? 'polls.hint.afterVote' : 'polls.hint.afterClose')}
      </ThemedText>

      {canManage && !poll.is_closed ? (
        <Button
          compact
          variant="outline"
          title={t(confirmClose ? 'polls.closeConfirm' : 'polls.close')}
          loading={close.isPending}
          onPress={() => (confirmClose ? close.mutate() : setConfirmClose(true))}
        />
      ) : null}
      {close.isError ? <ErrorText>{t('polls.closeFailed')}</ErrorText> : null}
    </View>
  );
}

/**
 * One answer, as on the website: a bordered row with the radio, the label, who voted for it (a few avatars) and its
 * count and share, with a tinted bar behind it that fills to that share. The option you chose has the accent border.
 */
function OptionRow({ poll, option, busy, onVote }: { poll: Poll; option: Option; busy: boolean; onVote: () => void }) {
  const { t } = useI18n();
  const theme = useTheme();
  const shape = useShape();
  const mine = poll.my_vote === option.id;
  const showResults = poll.results_visible && option.votes_count !== undefined;
  const share = showResults ? percentage(poll, option.votes_count ?? 0) : 0;
  const voters = option.voters ?? [];
  const more = Math.max(0, (option.votes_count ?? voters.length) - voters.length);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: mine, disabled: !poll.can_vote }}
      disabled={!poll.can_vote || busy}
      onPress={onVote}
      style={({ pressed }) => ({
        borderWidth: 1,
        borderColor: mine ? theme.primary : theme.border,
        borderRadius: shape.radius,
        overflow: 'hidden',
        opacity: busy ? 0.6 : pressed && poll.can_vote ? 0.85 : 1,
      })}
    >
      {showResults ? (
        // A tint of the accent (8-digit hex: 26 is about 15% opacity) behind the row, as wide as the option's share.
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${share}%`, backgroundColor: `${theme.primary}26` }} />
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingHorizontal: 12, paddingVertical: 10 }}>
        <Radio selected={mine} />
        <ThemedText type={mine ? 'smallBold' : 'small'} themeColor="text" style={{ flex: 1, fontSize: 15, lineHeight: 20 }}>
          {option.label}
        </ThemedText>

        {voters.length > 0 ? (
          <View accessibilityLabel={t('polls.votedFor')} style={{ flexDirection: 'row', alignItems: 'center' }}>
            {voters.map((voter, index) => (
              <View key={voter.id} style={{ marginLeft: index === 0 ? 0 : -6, borderRadius: 12, borderWidth: 2, borderColor: theme.background }}>
                <Avatar name={voter.name} uri={voter.avatar} size={24} />
              </View>
            ))}
            {more > 0 ? (
              <ThemedText type="small" themeColor="textSecondary" style={{ marginLeft: 6, fontSize: 12 }}>
                {t('polls.moreVoters', { count: more })}
              </ThemedText>
            ) : null}
          </View>
        ) : null}

        {!poll.can_vote && mine ? <Icon name="check" size={16} color={theme.text} /> : null}

        {showResults ? (
          <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12, fontVariant: ['tabular-nums'] }}>
            {option.votes_count} ({share}%)
          </ThemedText>
        ) : null}
      </View>
    </Pressable>
  );
}
