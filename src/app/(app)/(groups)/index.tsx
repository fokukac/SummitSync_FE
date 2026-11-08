import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, View } from 'react-native';

import { api, unwrap } from '@/api/client';
import type { components } from '@/api/schema';
import { Button, TextField } from '@/components/form';
import { Page } from '@/components/page';
import { ThemedText } from '@/components/themed-text';
import { Avatar, Card, Chip, QueryState, Segmented } from '@/components/ui';
import { useI18n } from '@/i18n';

type GroupSummary = components['schemas']['GroupSummaryResource'];

export default function GroupsScreen() {
  const { t } = useI18n();
  const [mode, setMode] = useState<'mine' | 'discover'>('mine');
  const [search, setSearch] = useState('');
  const term = search.trim().length >= 2 ? search.trim() : undefined;

  const mine = useQuery({
    queryKey: ['me', 'groups'],
    queryFn: async () => (await unwrap(api.GET('/v1/me/groups'))).data,
  });

  const discover = useInfiniteQuery({
    queryKey: ['groups', term],
    enabled: mode === 'discover',
    initialPageParam: 1,
    queryFn: ({ pageParam }) => unwrap(api.GET('/v1/groups', { params: { query: { q: term, page: pageParam } } })),
    getNextPageParam: (last) => (last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined),
  });

  const active = mode === 'mine' ? mine : discover;
  const groups: GroupSummary[] = mode === 'mine' ? (mine.data ?? []) : (discover.data?.pages.flatMap((page) => page.data) ?? []);

  return (
    <Page refreshControl={<RefreshControl refreshing={active.isRefetching && !active.isPending} onRefresh={() => void active.refetch()} />}>
      <ThemedText type="subtitle">{t('nav.groups')}</ThemedText>
      <Button variant="plain" title={t('groups.create')} onPress={() => router.push('/groups/new')} />
      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { value: 'mine', label: t('groups.yours') },
          { value: 'discover', label: t('groups.discover') },
        ]}
      />
      {mode === 'discover' ? <TextField label={t('nav.search')} value={search} onChangeText={setSearch} autoCapitalize="none" returnKeyType="search" /> : null}
      <QueryState query={active} empty={groups.length === 0} emptyText={t(mode === 'mine' ? 'groups.noneJoined' : 'groups.noneToDiscover')}>
        <View style={{ gap: 12 }}>
          {groups.map((group) => (
            <GroupCard key={group.slug} group={group} />
          ))}
          {mode === 'discover' && discover.hasNextPage ? (
            <Button variant="plain" title={t('groups.loadMore')} loading={discover.isFetchingNextPage} onPress={() => void discover.fetchNextPage()} />
          ) : null}
        </View>
      </QueryState>
    </Page>
  );
}

function GroupCard({ group }: { group: GroupSummary }) {
  const { t } = useI18n();

  return (
    <Card onPress={() => router.push({ pathname: '/groups/[slug]', params: { slug: group.slug } })}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Avatar name={group.name} uri={group.logo} size={44} />
        <View style={{ flex: 1 }}>
          <ThemedText type="smallBold">{group.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t('groups.membersCount', { count: group.members_count })}
            {group.visibility === 'private' ? ` · ${t('common.private')}` : ''}
          </ThemedText>
        </View>
      </View>
      {group.description ? (
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
          {group.description}
        </ThemedText>
      ) : null}
      {group.activities.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {group.activities.map((activity) => (
            <Chip key={activity.id} label={activity.name} />
          ))}
        </View>
      ) : null}
    </Card>
  );
}
