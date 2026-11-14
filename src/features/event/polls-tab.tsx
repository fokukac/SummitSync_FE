import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { api, unwrap } from '@/api/client';
import { Button, ErrorText } from '@/components/form';
import { PollForm } from '@/features/event/poll-form';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/card';
import { ProgressBar } from '@/components/progress-bar';
import { Radio } from '@/components/radio';
import { QueryState } from '@/components/query-state';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { formatShortDateTime } from '@/lib/format';

type Poll = Awaited<ReturnType<typeof loadPolls>>[number];

async function loadPolls(eventId: number) {
  return (
    await unwrap(
      api.GET('/v1/events/{event}/polls', {
        params: { path: { event: eventId } },
      }),
    )
  ).data;
}

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
      {canManage && !creating ? <Button title={t('polls.new')} onPress={() => setCreating(true)} /> : null}
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
  const queryClient = useQueryClient();
  const close = useMutation({
    mutationFn: () =>
      unwrap(
        api.POST('/v1/events/{event}/polls/{poll}/close', {
          params: { path: { event: eventId, poll: poll.id } },
        }),
      ),
    onSuccess: (updated) =>
      queryClient.setQueryData<Poll[]>(['event', eventId, 'polls'], (polls) => polls?.map((existing) => (existing.id === updated.id ? updated : existing))),
  });
  const vote = useMutation({
    mutationFn: (optionId: number) =>
      unwrap(
        api.POST('/v1/events/{event}/polls/{poll}/vote', {
          params: { path: { event: eventId, poll: poll.id } },
          body: { option_id: optionId },
        }),
      ),
    // The answer is this poll as the viewer may now see it (results can appear after voting).
    onSuccess: (updated) =>
      queryClient.setQueryData<Poll[]>(['event', eventId, 'polls'], (polls) => polls?.map((existing) => (existing.id === updated.id ? updated : existing))),
  });
  const theme = useTheme();
  const total = poll.total_votes ?? 0;

  return (
    <Card>
      <ThemedText type="subtitle" style={{ fontSize: 20, lineHeight: 26 }}>
        {poll.title}
      </ThemedText>
      {poll.description ? (
        <ThemedText type="small" themeColor="textSecondary">
          {poll.description}
        </ThemedText>
      ) : null}
      <ThemedText type="small" themeColor="textSecondary">
        <ThemedText type="smallBold" style={{ color: poll.is_closed ? theme.textSecondary : theme.primary }}>
          {t(poll.is_closed ? 'polls.closed' : 'polls.open')}
        </ThemedText>
        {` · ${t(poll.is_anonymous ? 'polls.anonymous' : 'polls.publicVotes')}`}
        {poll.closes_at && !poll.is_closed
          ? ` · ${t('polls.closesAt', { date: formatShortDateTime(poll.closes_at, Intl.DateTimeFormat().resolvedOptions().timeZone, intlLocale) })}`
          : ''}
      </ThemedText>
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
            style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8, opacity: vote.isPending ? 0.6 : 1 }}
          >
            <View style={{ paddingTop: 1 }}>
              <Radio selected={mine} />
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                <ThemedText type={mine ? 'smallBold' : 'small'} themeColor="text" style={{ flex: 1, fontSize: 15 }}>
                  {option.label}
                  {mine ? ` · ${t('polls.yourVote')}` : ''}
                </ThemedText>
                {poll.results_visible ? (
                  <ThemedText type="small" themeColor="textSecondary" style={{ fontVariant: ['tabular-nums'] }}>
                    {t('polls.votes', { count: option.votes_count ?? 0 })}
                  </ThemedText>
                ) : null}
              </View>
              {poll.results_visible ? <ProgressBar value={share} /> : null}
            </View>
          </Pressable>
        );
      })}
      {vote.isError ? <ErrorText>{t('polls.voteFailed')}</ErrorText> : null}
      {canManage && !poll.is_closed ? <Button variant="plain" title={t('polls.close')} onPress={() => close.mutate()} loading={close.isPending} /> : null}
      {close.isError ? <ErrorText>{t('polls.closeFailed')}</ErrorText> : null}
      {!poll.results_visible ? (
        <ThemedText type="small" themeColor="textSecondary">
          {t(poll.visibility === 'after_vote' ? 'polls.hint.afterVote' : 'polls.hint.afterClose')}
        </ThemedText>
      ) : null}
    </Card>
  );
}
