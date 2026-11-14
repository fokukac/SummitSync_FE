import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { api, unwrap } from '@/api/client';
import { TextField } from '@/components/form';
import { Page } from '@/components/page';
import { ThemedText } from '@/components/themed-text';
import { Avatar, Card, CardGrid, Chip, QueryState } from '@/components/ui';
import { GroupCard } from '@/features/group-card';
import { useI18n } from '@/i18n';
import { formatShortDateTime } from '@/lib/format';
import { searchTerm, useDebouncedValue } from '@/lib/search';

/** Groups, events and people in one search. Events and people only come from the viewer's own groups (the server enforces it). */
export default function SearchScreen() {
  const { t, intlLocale } = useI18n();
  const [input, setInput] = useState('');
  const term = searchTerm(useDebouncedValue(input));

  const search = useQuery({
    queryKey: ['search', term],
    enabled: term !== undefined,
    queryFn: () => unwrap(api.GET('/v1/search', { params: { query: { q: term } } })),
  });

  const results = search.data;
  const nothing = results !== undefined && results.groups.length + results.events.length + results.members.length === 0;

  return (
    <Page>
      <ThemedText type="subtitle">{t('nav.search')}</ThemedText>
      <TextField
        label={t('nav.search')}
        placeholder={t('search.placeholder')}
        value={input}
        onChangeText={setInput}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {term === undefined ? (
        <ThemedText type="small" themeColor="textSecondary">
          {t('search.hint')}
        </ThemedText>
      ) : (
        <QueryState query={search} empty={nothing} emptyText={t('search.noResults', { query: term })}>
          {results && results.groups.length > 0 ? (
            <Section title={t('search.groups')}>
              <CardGrid>
                {results.groups.map((group) => (
                  <GroupCard key={group.slug} group={group} />
                ))}
              </CardGrid>
            </Section>
          ) : null}

          {results && results.events.length > 0 ? (
            <Section title={t('search.events')}>
              {results.events.map((event) => (
                <Card key={event.id} onPress={() => router.push({ pathname: '/events/[id]', params: { id: String(event.id) } })}>
                  <ThemedText type="smallBold">{event.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {formatShortDateTime(event.starts_at, event.timezone, intlLocale)}
                    {event.location_name ? ` · ${event.location_name}` : ''}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {event.group.name} · {t('events.going', { count: event.participants_count })}
                  </ThemedText>
                  {event.status !== 'published' ? <Chip label={t(`events.status.${event.status}`)} /> : null}
                </Card>
              ))}
            </Section>
          ) : null}

          {results && results.members.length > 0 ? (
            <Section title={t('search.members')}>
              {results.members.map((member) => (
                <Card key={member.id}>
                  <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    <Avatar name={member.name} uri={member.avatar} />
                    <View style={{ flex: 1 }}>
                      <ThemedText type="smallBold">{member.name}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        @{member.username} · {member.groups.map((group) => group.name).join(', ')}
                      </ThemedText>
                    </View>
                  </View>
                </Card>
              ))}
            </Section>
          ) : null}

          <ThemedText type="small" themeColor="textSecondary">
            {t('search.scopeHint')}
          </ThemedText>
        </QueryState>
      )}
    </Page>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 12 }}>
      <ThemedText type="subtitle" style={{ fontSize: 22, lineHeight: 28 }}>
        {title}
      </ThemedText>
      {children}
    </View>
  );
}
