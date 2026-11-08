import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pressable, View } from 'react-native';

import { api, unwrap } from '@/api/client';
import { ErrorText } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { Card, Chip, QueryState } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { formatShortDateTime } from '@/lib/format';

type Poll = Awaited<ReturnType<typeof loadPolls>>[number];

async function loadPolls(eventId: number) {
  return (await unwrap(api.GET('/v1/events/{event}/polls', { params: { path: { event: eventId } } }))).data;
}

/** Vote counts are absent from the payload when the viewer may not see results yet, so a poll never reveals more than the server allows. */
export function PollsTab({ eventId }: { eventId: number }) {
  const { t } = useI18n();
  const polls = useQuery({ queryKey: ['event', eventId, 'polls'], queryFn: () => loadPolls(eventId) });

  return (
    <QueryState query={polls} empty={polls.data?.length === 0} emptyText={t('polls.none')}>
      {polls.data?.map((poll) => <PollCard key={poll.id} eventId={eventId} poll={poll} />)}
    </QueryState>
  );
}

function PollCard({ eventId, poll }: { eventId: number; poll: Poll }) {
  const { t, intlLocale } = useI18n();
  const queryClient = useQueryClient();
  const vote = useMutation({
    mutationFn: (optionId: number) => unwrap(api.POST('/v1/events/{event}/polls/{poll}/vote', { params: { path: { event: eventId, poll: poll.id } }, body: { option_id: optionId } })),
    // The answer is this poll as the viewer may now see it (results can appear after voting).
    onSuccess: (updated) => queryClient.setQueryData<Poll[]>(['event', eventId, 'polls'], (polls) => polls?.map((existing) => (existing.id === updated.id ? updated : existing))),
  });
  const theme = useTheme();
  const total = poll.total_votes ?? 0;

  return (
    <Card>
      <ThemedText type="smallBold">{poll.title}</ThemedText>
      {poll.description ? (
        <ThemedText type="small" themeColor="textSecondary">
          {poll.description}
        </ThemedText>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        <Chip label={t(poll.is_closed ? 'polls.closed' : 'polls.open')} />
        <Chip label={t(poll.is_anonymous ? 'polls.anonymous' : 'polls.publicVotes')} />
      </View>
      {poll.closes_at && !poll.is_closed ? (
        <ThemedText type="small" themeColor="textSecondary">
          {t('polls.closesAt', { date: formatShortDateTime(poll.closes_at, Intl.DateTimeFormat().resolvedOptions().timeZone, intlLocale) })}
        </ThemedText>
      ) : null}
      {poll.options.map((option) => {
        const mine = poll.my_vote === option.id;
        const share = poll.results_visible && total > 0 ? (option.votes_count ?? 0) / total : 0;

        return (
          <Pressable
            key={option.id}
            accessibilityRole="radio"
            accessibilityState={{ selected: mine, disabled: !poll.can_vote }}
            disabled={!poll.can_vote || vote.isPending}
            onPress={() => vote.mutate(option.id)}
            style={{ gap: 4, opacity: vote.isPending ? 0.6 : 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
              <ThemedText type={mine ? 'smallBold' : 'small'} style={{ flex: 1 }}>
                {option.label}
                {mine ? ` · ${t('polls.yourVote')}` : ''}
              </ThemedText>
              {poll.results_visible ? <ThemedText type="small">{t('polls.votes', { count: option.votes_count ?? 0 })}</ThemedText> : null}
            </View>
            {poll.results_visible ? (
              <View style={{ height: 6, borderRadius: 3, backgroundColor: theme.backgroundSelected }}>
                <View style={{ width: `${Math.round(share * 100)}%`, height: 6, borderRadius: 3, backgroundColor: theme.primary }} />
              </View>
            ) : null}
          </Pressable>
        );
      })}
      {vote.isError ? <ErrorText>{t('polls.voteFailed')}</ErrorText> : null}
      {!poll.results_visible ? (
        <ThemedText type="small" themeColor="textSecondary">
          {t(poll.visibility === 'after_vote' ? 'polls.hint.afterVote' : 'polls.hint.afterClose')}
        </ThemedText>
      ) : null}
    </Card>
  );
}
