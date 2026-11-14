import { useMutationState } from '@tanstack/react-query';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { useOnline } from '@/lib/online';

/** Says so when there is no connection, and how many queued changes are waiting to be sent. Renders nothing otherwise. */
export function OfflineBanner() {
  const { t } = useI18n();
  const theme = useTheme();
  const online = useOnline();
  const waiting = useMutationState({ filters: { predicate: (mutation) => mutation.state.isPaused }, select: () => 1 }).length;

  if (online && waiting === 0) {
    return null;
  }

  return (
    <View
      accessibilityRole="alert"
      style={{
        backgroundColor: theme.backgroundSelected,
        borderLeftWidth: 3,
        borderLeftColor: theme.primary,
        paddingVertical: 8,
        paddingHorizontal: 12,
        gap: 2,
      }}
    >
      {online ? null : <ThemedText type="smallBold">{t('offline.banner')}</ThemedText>}
      {waiting > 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          {t('offline.pending', { count: waiting })}
        </ThemedText>
      ) : null}
    </View>
  );
}
