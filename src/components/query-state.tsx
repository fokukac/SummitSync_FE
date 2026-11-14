import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { type ReactNode } from 'react';

import { Button } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';

type QueryLike = { isPending: boolean; isError: boolean; fetchStatus?: string; refetch: () => unknown };

/** The three non-happy states of a query, in one place; renders `children` once data is there. */
export function QueryState({ query, empty, emptyText, children }: { query: QueryLike; empty?: boolean; emptyText?: string; children: ReactNode }) {
  const { t } = useI18n();
  const theme = useTheme();

  // Offline with nothing saved yet: the request is paused, not failed, so say what is going on instead of spinning forever.
  if (query.isPending && query.fetchStatus === 'paused') {
    return (
      <View style={styles.state}>
        <ThemedText themeColor="textSecondary">{t('offline.noData')}</ThemedText>
      </View>
    );
  }

  if (query.isPending) {
    return <ActivityIndicator color={theme.primary} style={styles.state} />;
  }

  if (query.isError) {
    return (
      <View style={styles.state}>
        <ThemedText themeColor="textSecondary">{t('common.somethingWrong')}</ThemedText>
        <Button variant="plain" title={t('common.tryAgain')} onPress={() => void query.refetch()} />
      </View>
    );
  }

  if (empty) {
    return (
      <View style={styles.state}>
        <ThemedText themeColor="textSecondary">{emptyText}</ThemedText>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  state: { padding: Spacing.four, alignItems: 'center', gap: Spacing.two },
});
