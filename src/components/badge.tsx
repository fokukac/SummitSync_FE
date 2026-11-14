import { View } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { useShape, useTheme } from '@/hooks/use-theme';

/** A small status label: `filled` (the accent), `secondary` (a quiet fill) or `outline`, optionally with an icon. */
export function Badge({ label, variant = 'secondary', icon }: { label: string; variant?: 'filled' | 'secondary' | 'outline'; icon?: IconName }) {
  const theme = useTheme();
  const shape = useShape();
  const color = variant === 'filled' ? theme.onPrimary : theme.text;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: shape.radiusSmall + 2,
        backgroundColor: variant === 'filled' ? theme.primary : variant === 'secondary' ? theme.backgroundSelected : 'transparent',
        borderWidth: variant === 'outline' ? 1 : 0,
        borderColor: theme.border,
      }}
    >
      {icon ? <Icon name={icon} size={12} color={color} /> : null}
      <ThemedText type="smallBold" style={{ color, fontSize: 12, lineHeight: 16 }}>
        {label}
      </ThemedText>
    </View>
  );
}
