import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { useI18n } from '@/i18n';

/** Web tab bar: the native tabs component has no working web implementation, so the standard bottom tabs are used. */
export default function AppTabs() {
  const { t } = useI18n();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen name="(groups)" options={{ title: t('nav.groups'), tabBarIcon: () => null }} />
      <Tabs.Screen name="settings" options={{ title: t('nav.settings'), tabBarIcon: () => null }} />
    </Tabs>
  );
}
