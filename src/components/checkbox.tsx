import { View } from 'react-native';

import { Icon } from '@/components/icon';
import { useAppTheme } from '@/theme/theme-provider';

/** A square checkbox in the theme's small radius. `size` shrinks it for read-only lists. */
export function Checkbox({ checked, size = 26 }: { checked: boolean; size?: number }) {
  const { colors, shape } = useAppTheme();
  const small = size < 20;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: shape.radiusSmall + (small ? 0 : 1),
        borderWidth: small ? 1.5 : 2,
        borderColor: checked ? colors.primary : colors.textSecondary,
        backgroundColor: checked ? colors.primary : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {checked ? <Icon name="check" size={Math.round(size * 0.7)} color={colors.onPrimary} /> : null}
    </View>
  );
}
