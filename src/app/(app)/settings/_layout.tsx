import { Stack } from 'expo-router';

import { useI18n } from '@/i18n';
import { useStackOptions } from '@/theme/theme-provider';

export default function SettingsStack() {
  const { t } = useI18n();
  const options = useStackOptions();

  return (
    <Stack screenOptions={options}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: t('nav.profile') }} />
      <Stack.Screen name="security" options={{ title: t('nav.security') }} />
      <Stack.Screen name="blocked" options={{ title: t('settings.blocked.title') }} />
    </Stack>
  );
}
