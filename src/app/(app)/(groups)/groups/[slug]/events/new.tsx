import { useQueryClient } from '@tanstack/react-query';
import { router, Stack, useLocalSearchParams } from 'expo-router';

import { api } from '@/api/client';
import { Screen } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { EventForm } from '@/features/forms/event-form';
import { eventBody } from '@/lib/event-values';
import { useI18n } from '@/i18n';

export default function NewEventScreen() {
  const { t } = useI18n();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const queryClient = useQueryClient();

  return (
    <Screen>
      <Stack.Screen options={{ title: t('events.create') }} />
      <ThemedText type="subtitle">{t('events.create')}</ThemedText>
      <ThemedText themeColor="textSecondary">{t('events.create.description')}</ThemedText>
      <EventForm
        statusOptions={['draft', 'published']}
        submitLabel={t('events.create')}
        submit={async (values, run) => {
          const result = await run(api.POST('/v1/groups/{group}/events', { params: { path: { group: slug } }, body: eventBody(values) }));

          if (result?.data) {
            void queryClient.invalidateQueries({ queryKey: ['group', slug, 'events'] });
            router.replace({ pathname: '/events/[id]', params: { id: String(result.data.data.id) } });
          }
        }}
      />
    </Screen>
  );
}
