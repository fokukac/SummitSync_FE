import { View } from 'react-native';
import { type ReactNode } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Icon, type IconName } from '@/components/icon';
import { useTheme } from '@/hooks/use-theme';

/** One fact with its icon (when, where, who). */
export function Fact({ icon, children, secondary = false }: { icon: IconName; children: ReactNode; secondary?: boolean }) {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Icon name={icon} size={22} color={theme.primary} />
      <ThemedText style={{ flex: 1 }} themeColor={secondary ? 'textSecondary' : 'text'}>
        {children}
      </ThemedText>
    </View>
  );
}
