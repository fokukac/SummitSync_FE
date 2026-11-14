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
      <Stack.Screen name="groups/[slug]" options={{ title: t('nav.groups') }} />
      <Stack.Screen name="events/[id]" options={{ title: '' }} />
    </Stack>
  );
}

/** A deep link or a reload straight into a group or event keeps the groups list underneath, so back and the Groups tab lead somewhere. */
export const unstable_settings = { anchor: 'index' };
