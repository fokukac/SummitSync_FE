import { useQuery } from '@tanstack/react-query';
import { View } from 'react-native';

import { api, unwrap } from '@/api/client';
import { ThemedText } from '@/components/themed-text';
import { Avatar, Card, Chip, QueryState } from '@/components/ui';
import { useI18n } from '@/i18n';

export function ParticipantsTab({ eventId }: { eventId: number }) {
  const { t } = useI18n();
  const participants = useQuery({
    queryKey: ['event', eventId, 'participants'],
    queryFn: async () => (await unwrap(api.GET('/v1/events/{event}/participants', { params: { path: { event: eventId } } }))).data,
  });

  return (
    <QueryState query={participants} empty={participants.data?.length === 0} emptyText={t('checklist.breakdown.none')}>
      {participants.data?.map((person) => (
        <Card key={person.id}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Avatar name={person.name} uri={person.avatar} />
            <View style={{ flex: 1 }}>
              <ThemedText type="smallBold">{person.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                @{person.username}
              </ThemedText>
            </View>
            {person.role ? <Chip label={t(`events.role.${person.role}`)} /> : null}
          </View>
        </Card>
      ))}
    </QueryState>
  );
}
