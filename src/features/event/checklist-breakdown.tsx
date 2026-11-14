import { useQuery } from '@tanstack/react-query';
import { View } from 'react-native';

import { api, unwrap } from '@/api/client';
import { ThemedText } from '@/components/themed-text';
import { Avatar, Card, QueryState } from '@/components/ui';
import { useI18n } from '@/i18n';
import { breakdownRows } from '@/lib/checklist-breakdown';

/**
 * Who has checked what, for organizers and group admins. A separate request, made only while this is open: the
 * ordinary checklist never carries names (privacy invariant), and the server checks the permission again.
 */
export function ChecklistBreakdown({ eventId }: { eventId: number }) {
  const { t } = useI18n();

  const breakdown = useQuery({
    queryKey: ['event', eventId, 'checklist', 'breakdown'],
    staleTime: 0,
    queryFn: async () => (await unwrap(api.GET('/v1/events/{event}/checklist/breakdown', { params: { path: { event: eventId } } }))).data,
  });

  const rows = breakdown.data ? breakdownRows(breakdown.data) : [];

  return (
    <QueryState query={breakdown} empty={rows.length === 0} emptyText={t('checklist.breakdown.none')}>
      <View style={{ gap: 12 }}>
        {rows.map(({ person, done, total, items }) => (
          <Card key={person.id}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Avatar name={person.name} uri={person.avatar} />
              <View style={{ flex: 1 }}>
                <ThemedText type="smallBold">{person.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  @{person.username}
                </ThemedText>
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {t('checklist.breakdown.done')} {done}/{total}
              </ThemedText>
            </View>
            {items.map((item) => (
              <View
                key={item.id}
                accessible
                accessibilityLabel={`${item.label}: ${t(item.checked ? 'checklist.breakdown.checked' : 'checklist.breakdown.notChecked')}`}
                style={{ flexDirection: 'row', gap: 8 }}
              >
                <ThemedText type="small">{item.checked ? '☑' : '☐'}</ThemedText>
                <ThemedText type="small" themeColor={item.checked ? 'text' : 'textSecondary'}>
                  {item.label}
                </ThemedText>
              </View>
            ))}
          </Card>
        ))}
      </View>
    </QueryState>
  );
}
