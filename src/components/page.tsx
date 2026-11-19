import type { ReactElement, ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type RefreshControlProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OfflineBanner } from '@/components/offline-banner';
import { ThemedView } from '@/components/themed-view';
import { CONTENT_WIDTH, useBreakpoint } from '@/hooks/use-breakpoint';
import { useSpacing } from '@/hooks/use-spacing';

/** Scrollable content page inside the tabs: centered column with room for the tab bar. */
export function Page({ children, refreshControl }: { children: ReactNode; refreshControl?: ReactElement<RefreshControlProps> }) {
  const breakpoint = useBreakpoint();
  const space = useSpacing();

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <ScrollView
          refreshControl={refreshControl}
          contentContainerStyle={breakpoint === 'expanded' ? { paddingVertical: space.five, paddingHorizontal: space.five } : { padding: space.four }}
        >
          <View style={[styles.column, { maxWidth: CONTENT_WIDTH[breakpoint], gap: space.three }]}>
            <OfflineBanner />
            {children}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  column: { width: '100%', alignSelf: 'center' },
});
