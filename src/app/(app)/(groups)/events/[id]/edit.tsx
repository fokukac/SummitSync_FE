import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';

import { api, unwrap } from '@/api/client';
import { Screen } from '@/components/form';
import { QueryState } from '@/components/ui';
import { EventForm } from '@/features/forms/event-form';
import { eventBody, toFieldDateTime } from '@/lib/event-values';
import { useI18n } from '@/i18n';
import { goBackOr } from '@/lib/navigation';

export default function EditEventScreen() {
  const { t } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Number(id);
  const queryClient = useQueryClient();
  const event = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => (await unwrap(api.GET('/v1/events/{event}', { params: { path: { event: eventId } } }))).data,
  });
  const data = event.data;

  return (
    <Screen>
      <Stack.Screen options={{ title: t('events.edit') }} />
      <QueryState query={event}>
        {data ? (
          <EventForm
            initial={{
              title: data.title,
              description: data.description ?? '',
              startsAt: toFieldDateTime(data.starts_at_local),
              endsAt: toFieldDateTime(data.ends_at_local),
              timezone: data.timezone,
              place: { name: data.location_name ?? '', latitude: data.latitude, longitude: data.longitude },
              status: data.status,
              activityIds: (data.activities ?? []).map((activity) => activity.id),
            }}
            statusOptions={data.status_options}
            submitLabel={t('common.save')}
            submit={async (values, run) => {
              // The update body has the same fields as creating; the spec does not describe it yet, hence the cast.
              const result = await run(api.PATCH('/v1/events/{event}', { params: { path: { event: eventId } }, body: eventBody(values) as never }));

              if (result?.data) {
                queryClient.setQueryData(['event', eventId], result.data.data);
                void queryClient.invalidateQueries({ queryKey: ['group'] });
                goBackOr({ pathname: '/events/[id]', params: { id: String(eventId) } });
              }
            }}
          />
        ) : null}
      </QueryState>
    </Screen>
  );
}
