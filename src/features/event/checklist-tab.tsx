import { useQuery } from '@tanstack/react-query';
import { View } from 'react-native';

import { api, unwrap } from '@/api/client';
import { ThemedText } from '@/components/themed-text';
import { Card, QueryState } from '@/components/ui';
import { useI18n } from '@/i18n';

/** Read-only for now. The server only ever sends the viewer's own state plus anonymous counts (privacy invariant). */
export function ChecklistTab({ eventId }: { eventId: number }) {
  const { t } = useI18n();
  const checklist = useQuery({
    queryKey: ['event', eventId, 'checklist'],
    queryFn: async () => (await unwrap(api.GET('/v1/events/{event}/checklist', { params: { path: { event: eventId } } }))).data,
  });

  return (
    <QueryState query={checklist} empty={checklist.data?.length === 0} emptyText={t('events.tabs.checklist')}>
      {checklist.data?.map((item) => (
        <Card key={item.id}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <ThemedText accessibilityLabel={item.my_checked ? '✓' : '○'}>{item.my_checked ? '☑' : '☐'}</ThemedText>
            <ThemedText style={{ flex: 1, textDecorationLine: item.my_checked ? 'line-through' : 'none' }}>{item.label}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {item.checked_count}/{item.total_participants}
            </ThemedText>
          </View>
        </Card>
      ))}
    </QueryState>
  );
}
