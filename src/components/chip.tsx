import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useShape, useTheme } from '@/hooks/use-theme';

/** A small label (a selectable activity, a status). */
export function Chip({ label }: { label: string }) {
  const theme = useTheme();
  const shape = useShape();

  return (
    <View style={[styles.chip, { backgroundColor: theme.backgroundSelected, borderRadius: shape.radiusSmall }]}>
      <ThemedText type="small">{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.half },
});
