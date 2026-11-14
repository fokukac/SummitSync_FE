import { View } from 'react-native';
import { type ReactNode } from 'react';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

/** Quoted text with a rule on the left instead of a box around it. */
export function Note({ title, children }: { title?: string; children: ReactNode }) {
  const theme = useTheme();

  return (
    <View style={{ borderLeftWidth: 3, borderLeftColor: theme.primary, paddingLeft: 14, gap: 4 }}>
      {title ? (
        <ThemedText type="small" themeColor="textSecondary">
          {title}
        </ThemedText>
      ) : null}
      {children}
    </View>
  );
}
