import { useQueryClient } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';

import { api } from '@/api/client';
import { Screen } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { GroupForm } from '@/features/forms/group-form';
import { useI18n } from '@/i18n';

export default function NewGroupScreen() {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  return (
    <Screen>
      <Stack.Screen options={{ title: t('groups.create') }} />
      <ThemedText type="subtitle">{t('groups.create.title')}</ThemedText>
      <ThemedText themeColor="textSecondary">{t('groups.create.description')}</ThemedText>
      <GroupForm
        submitLabel={t('groups.create')}
        submit={async (values, run) => {
          const result = await run(
            api.POST('/v1/groups', {
              body: { name: values.name, description: values.description || null, visibility: values.visibility, activity_ids: values.activityIds },
            }),
          );

          if (result?.data) {
            void queryClient.invalidateQueries({ queryKey: ['me', 'groups'] });
            router.replace({ pathname: '/groups/[slug]', params: { slug: result.data.data.slug } });
          }
        }}
      />
    </Screen>
  );
}
