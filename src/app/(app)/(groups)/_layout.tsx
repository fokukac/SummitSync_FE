import { Stack } from 'expo-router';

import { useI18n } from '@/i18n';

/** Groups tab: its own stack, so group and event pages open inside the tab with a back button. */
export default function GroupsStack() {
  const { t } = useI18n();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="groups/[slug]" options={{ title: t('nav.groups') }} />
      <Stack.Screen name="events/[id]" options={{ title: '' }} />
    </Stack>
  );
}
