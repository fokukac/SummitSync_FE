import { View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** Thin progress bar, `value` between 0 and 1. */
export function ProgressBar({ value }: { value: number }) {
  const theme = useTheme();

  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: theme.border, overflow: 'hidden' }}>
      <View style={{ width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`, height: 6, backgroundColor: theme.primary }} />
    </View>
  );
}
