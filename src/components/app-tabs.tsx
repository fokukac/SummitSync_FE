import { Tabs } from 'expo-router';

import { useBreakpoint } from '@/hooks/use-breakpoint';
import { Icon } from '@/components/icon';
import { familyFor } from '@/constants/themes';
import { useI18n } from '@/i18n';
import { useAppTheme } from '@/theme/theme-provider';

/** The bottom tab bar, drawn the same on every platform so it follows the chosen theme (labels, icons, hairline). */
export default function AppTabs() {
  const { t } = useI18n();
  const { colors, body, shape } = useAppTheme();
  // Wide windows (desktop browser, tablet) get a side rail instead of the phone-style bottom bar.
  const rail = useBreakpoint() === 'expanded';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarPosition: rail ? 'left' : 'bottom',
        tabBarItemStyle: { borderRadius: shape.radius },
        tabBarVariant: rail ? 'material' : 'uikit',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.backgroundElement,
          borderTopColor: colors.border,
          borderTopWidth: rail ? 0 : 1,
          borderRightColor: colors.border,
          borderRightWidth: rail ? 1 : 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: familyFor(body, 600), fontSize: 11.5, textTransform: shape.uppercaseHeadings ? 'uppercase' : 'none' },
      }}
    >
      <Tabs.Screen name="(groups)" options={{ title: t('nav.groups'), tabBarIcon: ({ color }) => <Icon name="groups" color={String(color)} /> }} />
      <Tabs.Screen name="search" options={{ title: t('nav.search'), tabBarIcon: ({ color }) => <Icon name="search" color={String(color)} /> }} />
      <Tabs.Screen name="settings" options={{ title: t('nav.settings'), tabBarIcon: ({ color }) => <Icon name="settings" color={String(color)} /> }} />
    </Tabs>
  );
}
