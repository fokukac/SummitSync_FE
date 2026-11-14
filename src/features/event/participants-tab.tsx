import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { View } from 'react-native';

import { api, unwrapVoid, unwrap } from '@/api/client';
import { Button } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/avatar';
import { Card } from '@/components/card';
import { QueryState } from '@/components/query-state';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';

export function ParticipantsTab({ eventId, canAssign }: { eventId: number; canAssign: boolean }) {
  const { t } = useI18n();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const queryKey = ['event', eventId, 'participants'];
  const assistant = useMutation({
    mutationFn: ({ userId, make }: { userId: number; make: boolean }) =>
      unwrapVoid(
        make
          ? api.POST('/v1/events/{event}/assistants/{user}', {
              params: { path: { event: eventId, user: userId } },
            })
          : api.DELETE('/v1/events/{event}/assistants/{user}', {
              params: { path: { event: eventId, user: userId } },
            }),
      ),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey }),
  });
  const participants = useQuery({
    queryKey,
    queryFn: async () =>
      (
        await unwrap(
          api.GET('/v1/events/{event}/participants', {
            params: { path: { event: eventId } },
          }),
        )
      ).data,
  });

  return (
    <QueryState query={participants} empty={participants.data?.length === 0} emptyText={t('checklist.breakdown.none')} emptyIcon="groups">
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
            {person.role && person.role !== 'participant' ? (
              <ThemedText type="smallBold" style={{ color: theme.primary }}>
                {t(`events.role.${person.role}`)}
              </ThemedText>
            ) : null}
            {canAssign && person.role === 'participant' ? (
              <Button compact variant="plain" title={t('events.makeAssistant')} onPress={() => assistant.mutate({ userId: person.id, make: true })} />
            ) : null}
            {canAssign && person.role === 'assistant' ? (
              <Button compact variant="plain" title={t('events.removeAssistant')} onPress={() => assistant.mutate({ userId: person.id, make: false })} />
            ) : null}
          </View>
        </Card>
      ))}
    </QueryState>
  );
}
