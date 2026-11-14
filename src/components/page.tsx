import type { ReactElement, ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type RefreshControlProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { CONTENT_WIDTH, useBreakpoint } from '@/hooks/use-breakpoint';

/** Scrollable content page inside the tabs: centered column with room for the tab bar. */
export function Page({ children, refreshControl }: { children: ReactNode; refreshControl?: ReactElement<RefreshControlProps> }) {
  const breakpoint = useBreakpoint();

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <ScrollView refreshControl={refreshControl} contentContainerStyle={[styles.content, breakpoint === 'expanded' && styles.contentWide]}>
          <View style={[styles.column, { maxWidth: CONTENT_WIDTH[breakpoint] }]}>{children}</View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.four, paddingBottom: Spacing.four },
  contentWide: { paddingVertical: Spacing.five, paddingHorizontal: Spacing.five },
  column: { width: '100%', alignSelf: 'center', gap: Spacing.three },
});
