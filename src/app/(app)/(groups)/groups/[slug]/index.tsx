import { useQuery } from '@tanstack/react-query';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, View } from 'react-native';

import { api, unwrap } from '@/api/client';
import { Button } from '@/components/form';
import { Page } from '@/components/page';
import { ThemedText } from '@/components/themed-text';
import { Avatar, Card, Chip, QueryState, Segmented } from '@/components/ui';
import { GroupMembershipActions } from '@/features/membership-actions';
import { useI18n } from '@/i18n';
import { formatShortDateTime } from '@/lib/format';

export default function GroupScreen() {
  const { t, intlLocale } = useI18n();
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
    <Page refreshControl={<RefreshControl refreshing={refreshing && !group.isPending} onRefresh={refresh} />}>
      <Stack.Screen options={{ title: data?.name ?? t('nav.groups') }} />
      <QueryState query={group}>
        {data ? (
          <>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Avatar name={data.name} uri={data.logo} size={64} />
              <View style={{ flex: 1 }}>
                <ThemedText type="subtitle" style={{ fontSize: 24, lineHeight: 30 }}>
                  {data.name}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {t('groups.membersCount', { count: data.members_count })}
                  {data.visibility === 'private' ? ` · ${t('common.private')}` : ''}
                </ThemedText>
              </View>
            </View>
            {data.description ? <ThemedText>{data.description}</ThemedText> : null}
            {data.activities.length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {data.activities.map((activity) => (
                  <Chip key={activity.id} label={activity.name} />
                ))}
              </View>
            ) : null}

            <GroupMembershipActions slug={slug} can={data.can} />
            {data.can.createEvent ? (
              <Button title={t('events.create')} onPress={() => router.push({ pathname: '/groups/[slug]/events/new', params: { slug } })} />
            ) : null}
            {data.can.manageInvitations ? (
              <Button
                variant="plain"
                title={t('invitations.section.title')}
                onPress={() => router.push({ pathname: '/groups/[slug]/invitations', params: { slug } })}
              />
            ) : null}
            {data.can.update ? (
              <Button variant="plain" title={t('groups.edit')} onPress={() => router.push({ pathname: '/groups/[slug]/edit', params: { slug } })} />
            ) : null}

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
                  <QueryState query={events} empty={events.data?.length === 0} emptyText={t('groups.noUpcomingEvents')}>
                    {events.data?.map((event) => (
                      <Card key={event.id} onPress={() => router.push({ pathname: '/events/[id]', params: { id: String(event.id) } })}>
                        <ThemedText type="smallBold">{event.title}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {formatShortDateTime(event.starts_at, event.timezone, intlLocale)}
                          {event.location_name ? ` · ${event.location_name}` : ''}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {t('events.going', { count: event.participants_count })}
                        </ThemedText>
                      </Card>
                    ))}
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
                          {member.role === 'admin' ? <Chip label={t('common.admin')} /> : null}
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
