import { Tabs } from 'expo-router';

import { Icon } from '@/components/icon';
import { familyFor } from '@/constants/themes';
import { useI18n } from '@/i18n';
import { useAppTheme } from '@/theme/theme-provider';

/** The bottom tab bar, drawn the same on every platform so it follows the chosen theme (labels, icons, hairline). */
export default function AppTabs() {
  const { t } = useI18n();
  const { colors, body, shape } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.backgroundElement,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: familyFor(body, 600), fontSize: 11.5, textTransform: shape.uppercaseHeadings ? 'uppercase' : 'none' },
      }}
    >
      <Tabs.Screen name="(groups)" options={{ title: t('nav.groups'), tabBarIcon: ({ color }) => <Icon name="groups" color={String(color)} /> }} />
      <Tabs.Screen name="settings" options={{ title: t('nav.settings'), tabBarIcon: ({ color }) => <Icon name="settings" color={String(color)} /> }} />
    </Tabs>
  );
}
