import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { type ReactNode } from 'react';

import { Button } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';

type QueryLike = { isPending: boolean; isError: boolean; refetch: () => unknown };

/** The three non-happy states of a query, in one place; renders `children` once data is there. */
export function QueryState({ query, empty, emptyText, children }: { query: QueryLike; empty?: boolean; emptyText?: string; children: ReactNode }) {
  const { t } = useI18n();
  const theme = useTheme();

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
