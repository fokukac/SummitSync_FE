import { ActivityIndicator, StyleSheet } from 'react-native';
import { type ReactNode } from 'react';

import { EmptyState } from '@/components/empty-state';
import type { IconName } from '@/components/icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';

type QueryLike = { isPending: boolean; isError: boolean; fetchStatus?: string; refetch: () => unknown };

type Props = {
  query: QueryLike;
  empty?: boolean;
  emptyText?: string;
  /** Picture for the empty state. */
  emptyIcon?: IconName;
  /** What to do when it is empty (create the first one, ...). */
  emptyAction?: { title: string; onPress: () => void };
  /** Smaller states for a panel inside a page. */
  compact?: boolean;
  children: ReactNode;
};

/** The non-happy states of a query, in one place; renders `children` once data is there. */
export function QueryState({ query, empty, emptyText, emptyIcon = 'list', emptyAction, compact, children }: Props) {
  const { t } = useI18n();
  const theme = useTheme();

  // Offline with nothing saved yet: the request is paused, not failed, so say what is going on instead of spinning forever.
  if (query.isPending && query.fetchStatus === 'paused') {
    return <EmptyState icon="offline" text={t('offline.noData')} compact={compact} />;
  }

  if (query.isPending) {
    return <ActivityIndicator color={theme.primary} style={styles.loading} />;
  }

  if (query.isError) {
    return (
      <EmptyState
        icon="alert"
        text={t('common.somethingWrong')}
        action={{ title: t('common.tryAgain'), onPress: () => void query.refetch() }}
        compact={compact}
      />
    );
  }

  if (empty) {
    return <EmptyState icon={emptyIcon} text={emptyText ?? ''} action={emptyAction} compact={compact} />;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: { padding: Spacing.four },
});
