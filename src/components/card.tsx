import { Pressable, StyleSheet, View } from 'react-native';
import { type ReactNode } from 'react';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * A block of related content. Flat on purpose: no fill, no corners, just a hairline underneath, so lists read as
 * one surface instead of a stack of boxes inside boxes.
 */
export function Card({ children, onPress }: { children: ReactNode; onPress?: () => void }) {
  const theme = useTheme();
  const body = <View style={[styles.card, { borderBottomColor: theme.border }]}>{children}</View>;

  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      {body}
    </Pressable>
  ) : (
    body
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: Spacing.three, borderBottomWidth: StyleSheet.hairlineWidth, gap: Spacing.one },
});
