import { useQuery } from '@tanstack/react-query';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, View } from 'react-native';

import { api, unwrap } from '@/api/client';
import { Button } from '@/components/form';
import { Page } from '@/components/page';
import { ThemedText } from '@/components/themed-text';
import { Chip, QueryState, Segmented } from '@/components/ui';
import { ChatTab } from '@/features/event/chat-tab';
import { ChecklistTab } from '@/features/event/checklist-tab';
import { EventMembershipActions } from '@/features/membership-actions';
import { ParticipantsTab } from '@/features/event/participants-tab';
import { PollsTab } from '@/features/event/polls-tab';
import { useI18n } from '@/i18n';
import { formatEventDateTime } from '@/lib/format';

type Tab = 'overview' | 'chat' | 'checklist' | 'polls' | 'members';

export default function EventScreen() {
  const { t, intlLocale } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Number(id);
  const [tab, setTab] = useState<Tab>('overview');

  const event = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => (await unwrap(api.GET('/v1/events/{event}', { params: { path: { event: eventId } } }))).data,
  });
  const data = event.data;
  // Everything beyond the overview is for participants and group admins (the server enforces it; this hides the tabs).
  const canSeeInside = data?.can.view === true;

  const tabs: { value: Tab; label: string }[] = [
    { value: 'overview', label: t('events.tabs.overview') },
    ...(canSeeInside
      ? ([
          { value: 'chat', label: t('events.tabs.chat') },
          { value: 'checklist', label: t('events.tabs.checklist') },
          { value: 'polls', label: t('events.tabs.polls') },
          { value: 'members', label: t('events.tabs.members') },
        ] as { value: Tab; label: string }[])
      : []),
  ];

  return (
    <Page refreshControl={<RefreshControl refreshing={event.isRefetching} onRefresh={() => void event.refetch()} />}>
      <Stack.Screen options={{ title: data?.title ?? '' }} />
      <QueryState query={event}>
        {data ? (
          <>
            <Segmented value={tab} onChange={setTab} options={tabs} />

            {tab === 'overview' ? (
              <View style={{ gap: 12 }}>
                <ThemedText type="subtitle" style={{ fontSize: 26, lineHeight: 32 }}>
                  {data.title}
                </ThemedText>
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                  <Chip label={t(`events.status.${data.status}`)} />
                  {(data.activities ?? []).map((activity) => (
                    <Chip key={activity.id} label={activity.name} />
                  ))}
                </View>
                <ThemedText>{formatEventDateTime(data.starts_at, data.timezone, intlLocale)}</ThemedText>
                {data.location_name ? <ThemedText>{data.location_name}</ThemedText> : null}
                <ThemedText themeColor="textSecondary">{t('events.going', { count: data.participants_count })}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {data.group?.name}
                </ThemedText>
                {data.description ? <ThemedText>{data.description}</ThemedText> : null}
                <EventMembershipActions eventId={eventId} can={data.can} />
                {data.can.update ? (
                  <Button
                    variant="plain"
                    title={t('events.edit')}
                    onPress={() => router.push({ pathname: '/events/[id]/edit', params: { id: String(eventId) } })}
                  />
                ) : null}
                {!canSeeInside ? <ThemedText themeColor="textSecondary">{t('events.joinToSee')}</ThemedText> : null}
              </View>
            ) : null}
            {tab === 'chat' && canSeeInside ? <ChatTab eventId={eventId} canPost={data.can.postMessage} canModerate={data.can.moderateChat} /> : null}
            {tab === 'checklist' && canSeeInside ? (
              <ChecklistTab eventId={eventId} canToggle={data.can.toggleOwnChecklist} canManage={data.can.manageChecklist} />
            ) : null}
            {tab === 'polls' && canSeeInside ? <PollsTab eventId={eventId} canManage={data.can.managePolls} /> : null}
            {tab === 'members' && canSeeInside ? <ParticipantsTab eventId={eventId} canAssign={data.can.assignAssistants} /> : null}
          </>
        ) : null}
      </QueryState>
    </Page>
  );
}
