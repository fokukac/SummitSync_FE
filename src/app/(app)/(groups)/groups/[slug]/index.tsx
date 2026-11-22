import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, View } from 'react-native';

import { api, unwrap } from '@/api/client';
import { Button } from '@/components/form';
import { Page } from '@/components/page';
import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/avatar';
import { Card } from '@/components/card';
import { QueryState } from '@/components/query-state';
import { Segmented } from '@/components/segmented';
import { ActivityTags } from '@/features/activity-tags';
import { GroupMembershipActions } from '@/features/membership-actions';
import { useI18n } from '@/i18n';
import { EventRow } from '@/features/event-row';
import { useTheme } from '@/hooks/use-theme';

export default function GroupScreen() {
  const { t } = useI18n();
  const theme = useTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [tab, setTab] = useState<'events' | 'members'>('events');

  const group = useQuery({
    queryKey: ['group', slug],
    queryFn: async () => (await unwrap(api.GET('/v1/groups/{group}', { params: { path: { group: slug } } }))).data,
  });
  const canSeeInside = group.data?.can.viewMembers === true;

  const events = useQuery({
    queryKey: ['group', slug, 'events'],
    enabled: canSeeInside,
    queryFn: async () => (await unwrap(api.GET('/v1/groups/{group}/events', { params: { path: { group: slug }, query: { scope: 'upcoming' } } }))).data,
  });
  const members = useQuery({
    queryKey: ['group', slug, 'members'],
    enabled: canSeeInside && tab === 'members',
    queryFn: async () => (await unwrap(api.GET('/v1/groups/{group}/members', { params: { path: { group: slug } } }))).data,
  });

  const refreshing = group.isRefetching || events.isRefetching || members.isRefetching;
  const refresh = () =>
    void Promise.all([group.refetch(), canSeeInside ? events.refetch() : null, tab === 'members' && canSeeInside ? members.refetch() : null]);
  const data = group.data;

  return (
    <Page underHeader refreshControl={<RefreshControl refreshing={refreshing && !group.isPending} onRefresh={refresh} />}>
      <QueryState query={group}>
        {data ? (
          <>
            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
              <Avatar name={data.name} uri={data.logo} size={80} />
              <View style={{ flex: 1 }}>
                <ThemedText type="subtitle" style={{ fontSize: 26, lineHeight: 32 }}>
                  {data.name}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {t('groups.membersCount', { count: data.members_count })}
                  {data.visibility === 'private' ? ` · ${t('common.private')}` : ''}
                </ThemedText>
              </View>
            </View>
            {data.description ? <ThemedText>{data.description}</ThemedText> : null}
            {data.activities.length > 0 ? <ActivityTags activities={data.activities} /> : null}

            {/* What you can do here, in one row: the main action first, the rest as quiet text buttons. */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 6, rowGap: 4 }}>
              <GroupMembershipActions slug={slug} can={data.can} />
              {data.can.createEvent ? (
                <Button compact title={t('events.create')} onPress={() => router.push({ pathname: '/groups/[slug]/events/new', params: { slug } })} />
              ) : null}
              {data.can.manageInvitations ? (
                <Button
                  compact
                  variant="plain"
                  title={t('invitations.section.title')}
                  onPress={() => router.push({ pathname: '/groups/[slug]/invitations', params: { slug } })}
                />
              ) : null}
              {data.can.update ? (
                <Button compact variant="plain" title={t('groups.edit')} onPress={() => router.push({ pathname: '/groups/[slug]/edit', params: { slug } })} />
              ) : null}
            </View>

            {canSeeInside ? (
              <>
                <Segmented
                  value={tab}
                  onChange={setTab}
                  options={[
                    { value: 'events', label: t('groups.upcomingEvents') },
                    { value: 'members', label: t('groups.members') },
                  ]}
                />
                {tab === 'events' ? (
                  <QueryState
                    query={events}
                    empty={events.data?.length === 0}
                    emptyText={t('groups.noUpcomingEvents')}
                    emptyIcon="calendar"
                    emptyAction={
                      data.can.createEvent
                        ? { title: t('events.create'), onPress: () => router.push({ pathname: '/groups/[slug]/events/new', params: { slug } }) }
                        : undefined
                    }
                  >
                    <View>
                      {events.data?.map((event) => (
                        <EventRow key={event.id} event={event} />
                      ))}
                    </View>
                  </QueryState>
                ) : (
                  <QueryState query={members}>
                    {members.data?.map((member) => (
                      <Card key={member.id}>
                        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                          <Avatar name={member.name} uri={member.avatar} />
                          <View style={{ flex: 1 }}>
                            <ThemedText type="smallBold">{member.name}</ThemedText>
                            <ThemedText type="small" themeColor="textSecondary">
                              @{member.username}
                            </ThemedText>
                          </View>
                          {member.role === 'admin' ? (
                            <ThemedText type="smallBold" style={{ color: theme.primary }}>
                              {t('common.admin')}
                            </ThemedText>
                          ) : null}
                        </View>
                      </Card>
                    ))}
                  </QueryState>
                )}
              </>
            ) : (
              <ThemedText themeColor="textSecondary">{t('groups.privateNotice')}</ThemedText>
            )}
          </>
        ) : null}
      </QueryState>
    </Page>
  );
}
