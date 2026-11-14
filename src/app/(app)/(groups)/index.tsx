import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, View } from 'react-native';

import { api, unwrap } from '@/api/client';
import { Button, TextField } from '@/components/form';
import { Page } from '@/components/page';
import { ThemedText } from '@/components/themed-text';
import { QueryState, Segmented } from '@/components/ui';
import { GroupCard, type GroupSummary } from '@/features/group-card';
import { useI18n } from '@/i18n';

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
      <Button variant="plain" title={t('nav.search')} onPress={() => router.push('/search')} />
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
