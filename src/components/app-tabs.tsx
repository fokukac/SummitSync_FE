import { NativeTabs } from 'expo-router/native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { useI18n } from '@/i18n';

/** Native tab bar (Android/iOS). The web counterpart is `app-tabs.web.tsx`. */
export default function AppTabs() {
  const { t } = useI18n();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <NativeTabs backgroundColor={colors.background} indicatorColor={colors.backgroundElement} labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="(groups)">
        <NativeTabs.Trigger.Label>{t('nav.groups')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/images/tabIcons/home.png')} renderingMode="template" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>{t('nav.settings')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/images/tabIcons/explore.png')} renderingMode="template" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
