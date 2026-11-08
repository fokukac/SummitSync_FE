import { useQuery } from '@tanstack/react-query';
import { View } from 'react-native';

import { api, unwrap } from '@/api/client';
import { ThemedText } from '@/components/themed-text';
import { Card, Chip, QueryState } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { formatShortDateTime } from '@/lib/format';

type Poll = Awaited<ReturnType<typeof loadPolls>>[number];

async function loadPolls(eventId: number) {
  return (await unwrap(api.GET('/v1/events/{event}/polls', { params: { path: { event: eventId } } }))).data;
}

/** Read-only for now. Vote counts are absent from the payload when the viewer may not see results yet. */
export function PollsTab({ eventId }: { eventId: number }) {
  const { t } = useI18n();
  const polls = useQuery({ queryKey: ['event', eventId, 'polls'], queryFn: () => loadPolls(eventId) });

  return (
    <QueryState query={polls} empty={polls.data?.length === 0} emptyText={t('polls.none')}>
      {polls.data?.map((poll) => <PollCard key={poll.id} poll={poll} />)}
    </QueryState>
  );
}

function PollCard({ poll }: { poll: Poll }) {
  const { t, intlLocale } = useI18n();
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
          <View key={option.id} style={{ gap: 4 }}>
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
          </View>
        );
      })}
      {!poll.results_visible ? (
        <ThemedText type="small" themeColor="textSecondary">
          {t(poll.visibility === 'after_vote' ? 'polls.hint.afterVote' : 'polls.hint.afterClose')}
        </ThemedText>
      ) : null}
    </Card>
  );
}
