import { Pressable, StyleSheet, View } from 'react-native';

import { useAuth } from '@/auth/auth-context';
import { Button, Screen } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { supportedLocales, useI18n } from '@/i18n';

export default function SettingsScreen() {
  const { t, locale, setLocale } = useI18n();
  const { user, signOut } = useAuth();

  return (
    <Screen>
      <ThemedText type="subtitle">{t('nav.settings')}</ThemedText>
      <View>
        <ThemedText type="smallBold">{user?.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {user?.email}
        </ThemedText>
      </View>
      <ThemedText type="smallBold">{t('nav.language')}</ThemedText>
      <View style={styles.row}>
        {Object.entries(supportedLocales).map(([code, name]) => (
          <Pressable key={code} accessibilityRole="button" accessibilityState={{ selected: locale === code }} onPress={() => setLocale(code)}>
            <ThemedText type={locale === code ? 'smallBold' : 'small'} themeColor={locale === code ? 'text' : 'textSecondary'}>
              {name}
            </ThemedText>
          </Pressable>
        ))}
      </View>
      <Button variant="plain" title={t('nav.logout')} onPress={() => void signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.three },
});
