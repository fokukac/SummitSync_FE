import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { View } from 'react-native';

import { api, unwrap, unwrapVoid } from '@/api/client';
import { Button, Screen } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { Avatar, Card, QueryState } from '@/components/ui';
import { useI18n } from '@/i18n';

/** People you blocked. Their chat messages are left out of history by the server. */
export default function BlockedScreen() {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const blocked = useQuery({ queryKey: ['me', 'blocks'], queryFn: async () => (await unwrap(api.GET('/v1/me/blocks'))).data });

  const unblock = useMutation({
    mutationFn: (userId: number) => unwrapVoid(api.DELETE('/v1/users/{user}/block', { params: { path: { user: userId } } })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['me', 'blocks'] });
      void queryClient.invalidateQueries({ queryKey: ['event'] });
    },
  });

  return (
    <Screen>
      <QueryState query={blocked} empty={blocked.data?.length === 0} emptyText={t('settings.blocked.none')}>
        {blocked.data?.map((person) => (
          <Card key={person.id}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Avatar name={person.name} uri={person.avatar} />
              <View style={{ flex: 1 }}>
                <ThemedText type="smallBold">{person.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  @{person.username}
                </ThemedText>
              </View>
              <Button variant="plain" title={t('settings.blocked.unblock')} loading={unblock.isPending && unblock.variables === person.id} onPress={() => unblock.mutate(person.id)} />
            </View>
          </Card>
        ))}
      </QueryState>
    </Screen>
  );
}
