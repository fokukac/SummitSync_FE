import { Stack } from 'expo-router';

import { useI18n } from '@/i18n';
import { useStackOptions } from '@/theme/theme-provider';

/** Groups tab: its own stack, so group and event pages open inside the tab with a back button. */
export default function GroupsStack() {
  const { t } = useI18n();
  const options = useStackOptions();

  return (
    <Stack screenOptions={options}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ title: t('nav.search') }} />
      <Stack.Screen name="groups/[slug]" options={{ title: t('nav.groups') }} />
      <Stack.Screen name="events/[id]" options={{ title: '' }} />
    </Stack>
  );
}
