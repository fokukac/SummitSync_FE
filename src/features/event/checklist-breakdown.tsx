import { useQuery } from '@tanstack/react-query';
import { View } from 'react-native';

import { api, unwrap } from '@/api/client';
import { Avatar } from '@/components/avatar';
import { Card } from '@/components/card';
import { CardGrid } from '@/components/card-grid';
import { Checkbox } from '@/components/checkbox';
import { ProgressBar } from '@/components/progress-bar';
import { QueryState } from '@/components/query-state';
import { ThemedText } from '@/components/themed-text';
import { useI18n } from '@/i18n';
import { breakdownRows } from '@/lib/checklist-breakdown';

/**
 * Who has checked what, for organizers and group admins: one block per person with their progress and each item
 * ticked or not. A separate request, made only while this is open: the ordinary checklist never carries names
 * (privacy invariant), and the server checks the permission again.
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
    <QueryState query={breakdown} empty={rows.length === 0} emptyText={t('checklist.breakdown.none')} emptyIcon="groups" compact>
      <CardGrid>
        {rows.map(({ person, done, total, items }) => (
          <Card key={person.id}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Avatar name={person.name} uri={person.avatar} size={40} />
              <View style={{ flex: 1 }}>
                <ThemedText type="smallBold">{person.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  @{person.username}
                </ThemedText>
              </View>
              <ThemedText type="smallBold" themeColor="textSecondary" style={{ fontVariant: ['tabular-nums'] }}>
                {done}/{total}
              </ThemedText>
            </View>
            <ProgressBar value={total > 0 ? done / total : 0} />
            <View style={{ gap: 6, marginTop: 4 }}>
              {items.map((item) => (
                <View
                  key={item.id}
                  accessible
                  accessibilityLabel={`${item.label}: ${t(item.checked ? 'checklist.breakdown.checked' : 'checklist.breakdown.notChecked')}`}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
                >
                  <Checkbox checked={item.checked} size={16} />
                  <ThemedText type="small" themeColor={item.checked ? 'text' : 'textSecondary'} style={{ flex: 1 }}>
                    {item.label}
                  </ThemedText>
                </View>
              ))}
            </View>
          </Card>
        ))}
      </CardGrid>
    </QueryState>
  );
}
